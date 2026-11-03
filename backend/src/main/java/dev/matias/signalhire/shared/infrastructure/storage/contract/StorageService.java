package dev.matias.signalhire.shared.infrastructure.storage.contract;

import org.bson.types.ObjectId;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

public interface StorageService {

    // Presigned Upload (Directly from PC / Browser to S3)
    PresignedUploadResponse generatePresignedUploadUrl(String category, String ownerId, String filename, String contentType);

    // S3 Multipart Upload
    InitiateMultipartResponse initiateMultipartUpload(String category, String ownerId, String filename, String contentType);

    String presignUploadPart(String key, String uploadId, int partNumber);

    String completeMultipartUpload(String key, String uploadId, List<PartETagDTO> parts);

    void abortMultipartUpload(String key, String uploadId);

    // Direct MultipartFile Upload (backend helper)
    String uploadAvatar(ObjectId userId, MultipartFile file);

    String uploadCompanyLogo(ObjectId companyId, MultipartFile file);

    // Retrieve & Delete
    StoredObject getObject(String key);

    void deleteObject(String key);

    record StoredObject(InputStream inputStream, String contentType, Long contentLength) {}

    record PresignedUploadResponse(String uploadUrl, String fileUrl, String key) {}

    record InitiateMultipartResponse(String uploadId, String key, String fileUrl) {}

    record PartETagDTO(int partNumber, String etag) {}
}
