import { api } from "../lib/api";

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export interface InitiateMultipartResponse {
  uploadId: string;
  key: string;
  fileUrl: string;
}

export interface PartETagDTO {
  partNumber: number;
  etag: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per part for S3 multipart

export const fileUploadService = {
  /**
   * Obtém URL pré-assinada para upload direto.
   */
  async getPresignedUploadUrl(
    category: "company" | "profile",
    filename: string,
    contentType: string,
    ownerId?: string,
  ): Promise<PresignedUploadResponse> {
    const response = await api.post<PresignedUploadResponse>(
      "/api/files/presigned-url",
      {
        category,
        filename,
        contentType,
        ownerId,
      },
    );
    return response.data;
  },

  /**
   * Fallback transparente caso a conexão direta do browser com o S3/LocalStack seja bloqueada por CORS ou rede.
   */
  async uploadViaBackendFallback(
    file: File,
    category: "company" | "profile",
    ownerId?: string,
  ): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    if (ownerId) {
      formData.append("ownerId", ownerId);
    }

    const response = await api.post<{ fileUrl: string }>(
      "/api/files/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.fileUrl;
  },

  /**
   * Upload direto usando PUT com URL pré-assinada, com fallback automático em caso de bloqueio de rede/CORS.
   */
  async uploadDirectToS3(
    file: File,
    category: "company" | "profile",
    ownerId?: string,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    const contentType = file.type || "image/png";

    try {
      const { uploadUrl, fileUrl } = await this.getPresignedUploadUrl(
        category,
        file.name,
        contentType,
        ownerId,
      );

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", contentType);

        if (onProgress && xhr.upload) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            if (onProgress) onProgress(100);
            resolve();
          } else {
            reject(new Error(`Falha no upload (status ${xhr.status})`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Erro de conexão ao enviar o arquivo"));
        };

        xhr.send(file);
      });

      return fileUrl;
    } catch {
      // Fallback transparente: envia via backend para salvar no bucket sem falha
      return this.uploadViaBackendFallback(file, category, ownerId);
    }
  },

  /**
   * Upload Multipart para arquivos maiores.
   */
  async uploadMultipartToS3(
    file: File,
    category: "company" | "profile",
    ownerId?: string,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    const contentType = file.type || "image/png";

    try {
      // 1. Initiate Multipart
      const initRes = await api.post<InitiateMultipartResponse>(
        "/api/files/multipart/initiate",
        {
          category,
          filename: file.name,
          contentType,
          ownerId,
        },
      );

      const { uploadId, key, fileUrl } = initRes.data;
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const completedParts: PartETagDTO[] = [];

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // 2. Presign Part URL
        const presignRes = await api.post<{ uploadUrl: string }>(
          "/api/files/multipart/presign-part",
          {
            key,
            uploadId,
            partNumber,
          },
        );

        const partUploadUrl = presignRes.data.uploadUrl;

        // 3. Upload chunk
        const res = await fetch(partUploadUrl, {
          method: "PUT",
          body: chunk,
          headers: {
            "Content-Type": contentType,
          },
        });

        if (!res.ok) {
          throw new Error(`Falha ao processar parte ${partNumber}`);
        }

        const etag =
          res.headers.get("ETag")?.replace(/"/g, "") ||
          `etag-part-${partNumber}`;
        completedParts.push({ partNumber, etag });

        if (onProgress) {
          const percent = Math.round((partNumber / totalParts) * 100);
          onProgress(percent);
        }
      }

      // 4. Complete Multipart
      await api.post("/api/files/multipart/complete", {
        key,
        uploadId,
        parts: completedParts,
      });

      return fileUrl;
    } catch {
      // Fallback seguro via backend
      return this.uploadViaBackendFallback(file, category, ownerId);
    }
  },

  /**
   * Ponto de entrada unificado para uploads.
   */
  async uploadFile(
    file: File,
    category: "company" | "profile",
    ownerId?: string,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    if (file.size > CHUNK_SIZE) {
      return this.uploadMultipartToS3(file, category, ownerId, onProgress);
    }
    return this.uploadDirectToS3(file, category, ownerId, onProgress);
  },
};
