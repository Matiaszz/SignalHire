package dev.matias.signalhire.shared.infrastructure.storage.presentation;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

public class FileDTOs {

    @Builder
    public record GeneratePresignedUrlRequestDTO(
            @NotBlank(message = "A categoria é obrigatória (ex: company, profile).")
            String category,

            String ownerId,

            @NotBlank(message = "O nome do arquivo é obrigatório.")
            String filename,

            @NotBlank(message = "O tipo do conteúdo (MIME type) é obrigatório.")
            String contentType
    ) {}

    @Builder
    public record InitiateMultipartRequestDTO(
            @NotBlank(message = "A categoria é obrigatória.")
            String category,

            String ownerId,

            @NotBlank(message = "O nome do arquivo é obrigatório.")
            String filename,

            @NotBlank(message = "O tipo de conteúdo é obrigatório.")
            String contentType
    ) {}

    @Builder
    public record PresignPartRequestDTO(
            @NotBlank(message = "A chave do S3 é obrigatória.")
            String key,

            @NotBlank(message = "O ID do upload multipart é obrigatório.")
            String uploadId,

            int partNumber
    ) {}

    @Builder
    public record CompleteMultipartRequestDTO(
            @NotBlank(message = "A chave do S3 é obrigatória.")
            String key,

            @NotBlank(message = "O ID do upload multipart é obrigatório.")
            String uploadId,

            java.util.List<dev.matias.signalhire.shared.infrastructure.storage.contract.StorageService.PartETagDTO> parts
    ) {}

    @Builder
    public record AbortMultipartRequestDTO(
            @NotBlank(message = "A chave do S3 é obrigatória.")
            String key,

            @NotBlank(message = "O ID do upload multipart é obrigatório.")
            String uploadId
    ) {}
}
