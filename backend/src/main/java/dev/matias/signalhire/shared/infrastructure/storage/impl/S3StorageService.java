package dev.matias.signalhire.shared.infrastructure.storage.impl;

import dev.matias.signalhire.shared.infrastructure.storage.contract.StorageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedUploadPartRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.UploadPartPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "s3", matchIfMissing = true)
public class S3StorageService implements StorageService {

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    private static final Duration PRESIGNED_URL_EXPIRATION = Duration.ofMinutes(15);
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/svg+xml"
    );

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3StorageProperties properties;

    @PostConstruct
    public void init() {
        ensureBucketExists();
    }

    public synchronized void ensureBucketExists() {
        String bucket = properties.getS3().getBucket();
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
            log.info("S3 Bucket '{}' is ready.", bucket);
            configureBucketCors(bucket);
        } catch (NoSuchBucketException e) {
            log.info("S3 Bucket '{}' does not exist. Creating it...", bucket);
            createBucket(bucket);
            configureBucketCors(bucket);
        } catch (Exception e) {
            log.warn("Could not connect to S3/LocalStack at startup: {}. Will retry on next request.", e.getMessage());
        }
    }

    private void createBucket(String bucket) {
        try {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            log.info("S3 Bucket '{}' created successfully.", bucket);
        } catch (Exception e) {
            log.error("Failed to create S3 bucket '{}': {}", bucket, e.getMessage());
        }
    }

    private void configureBucketCors(String bucket) {
        try {
            CORSRule corsRule = CORSRule.builder()
                    .allowedHeaders("*")
                    .allowedMethods("GET", "PUT", "POST", "DELETE", "HEAD")
                    .allowedOrigins("*")
                    .maxAgeSeconds(3000)
                    .build();

            s3Client.putBucketCors(PutBucketCorsRequest.builder()
                    .bucket(bucket)
                    .corsConfiguration(CORSConfiguration.builder().corsRules(corsRule).build())
                    .build());
            log.info("S3 Bucket '{}' CORS policy configured.", bucket);
        } catch (Exception e) {
            log.warn("Could not configure CORS for S3 bucket '{}': {}", bucket, e.getMessage());
        }
    }

    @Override
    public PresignedUploadResponse generatePresignedUploadUrl(String category, String ownerId, String filename, String contentType) {
        ensureBucketExists();
        validateContentType(contentType);

        String normalizedCategory = normalizeCategory(category);
        String cleanFilename = resolveFilename(filename, contentType);
        String key = "files/" + normalizedCategory + "/" + ownerId + "/" + cleanFilename;
        String bucket = properties.getS3().getBucket();

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(PRESIGNED_URL_EXPIRATION)
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedPutObjectRequest = s3Presigner.presignPutObject(presignRequest);
        String uploadUrl = presignedPutObjectRequest.url().toString();
        String fileUrl = "/api/files/" + normalizedCategory + "/" + ownerId + "/" + cleanFilename;

        log.info("Generated presigned upload URL for key: {}", key);
        return new PresignedUploadResponse(uploadUrl, fileUrl, key);
    }

    @Override
    public InitiateMultipartResponse initiateMultipartUpload(String category, String ownerId, String filename, String contentType) {
        ensureBucketExists();
        validateContentType(contentType);

        String normalizedCategory = normalizeCategory(category);
        String cleanFilename = resolveFilename(filename, contentType);
        String key = "files/" + normalizedCategory + "/" + ownerId + "/" + cleanFilename;
        String bucket = properties.getS3().getBucket();

        CreateMultipartUploadRequest createRequest = CreateMultipartUploadRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();

        CreateMultipartUploadResponse response = s3Client.createMultipartUpload(createRequest);
        String fileUrl = "/api/files/" + normalizedCategory + "/" + ownerId + "/" + cleanFilename;

        log.info("Initiated S3 Multipart Upload for key: {}, uploadId: {}", key, response.uploadId());
        return new InitiateMultipartResponse(response.uploadId(), key, fileUrl);
    }

    @Override
    public String presignUploadPart(String key, String uploadId, int partNumber) {
        String bucket = properties.getS3().getBucket();

        UploadPartRequest uploadPartRequest = UploadPartRequest.builder()
                .bucket(bucket)
                .key(key)
                .uploadId(uploadId)
                .partNumber(partNumber)
                .build();

        UploadPartPresignRequest presignRequest = UploadPartPresignRequest.builder()
                .signatureDuration(PRESIGNED_URL_EXPIRATION)
                .uploadPartRequest(uploadPartRequest)
                .build();

        PresignedUploadPartRequest presignedRequest = s3Presigner.presignUploadPart(presignRequest);
        return presignedRequest.url().toString();
    }

    @Override
    public String completeMultipartUpload(String key, String uploadId, List<PartETagDTO> parts) {
        String bucket = properties.getS3().getBucket();

        List<CompletedPart> completedParts = parts.stream()
                .map(p -> CompletedPart.builder()
                        .partNumber(p.partNumber())
                        .eTag(p.etag())
                        .build())
                .toList();

        CompletedMultipartUpload completedMultipartUpload = CompletedMultipartUpload.builder()
                .parts(completedParts)
                .build();

        CompleteMultipartUploadRequest completeRequest = CompleteMultipartUploadRequest.builder()
                .bucket(bucket)
                .key(key)
                .uploadId(uploadId)
                .multipartUpload(completedMultipartUpload)
                .build();

        s3Client.completeMultipartUpload(completeRequest);
        log.info("Completed S3 Multipart Upload for key: {}, uploadId: {}", key, uploadId);

        return "/" + key;
    }

    @Override
    public void abortMultipartUpload(String key, String uploadId) {
        String bucket = properties.getS3().getBucket();
        try {
            s3Client.abortMultipartUpload(AbortMultipartUploadRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .uploadId(uploadId)
                    .build());
            log.info("Aborted S3 Multipart Upload for key: {}, uploadId: {}", key, uploadId);
        } catch (Exception e) {
            log.warn("Failed to abort multipart upload for key '{}': {}", key, e.getMessage());
        }
    }

    @Override
    public String uploadAvatar(ObjectId userId, MultipartFile file) {
        validateMultipartFile(file);
        ensureBucketExists();

        String rawOriginalFilename = file.getOriginalFilename();
        String extension = getFileExtension(rawOriginalFilename, file.getContentType());
        String filename = "profileImage" + extension;
        String key = "files/profile/" + userId + "/" + filename;

        uploadToS3(key, file);
        return "/api/files/profile/" + userId + "/" + filename;
    }

    @Override
    public String uploadCompanyLogo(ObjectId companyId, MultipartFile file) {
        validateMultipartFile(file);
        ensureBucketExists();

        String rawOriginalFilename = file.getOriginalFilename();
        String extension = getFileExtension(rawOriginalFilename, file.getContentType());
        String filename = "logo" + extension;
        String key = "files/company/" + companyId + "/" + filename;

        uploadToS3(key, file);
        return "/api/files/company/" + companyId + "/" + filename;
    }

    private void uploadToS3(String key, MultipartFile file) {
        String bucket = properties.getS3().getBucket();
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("Uploaded object to S3 key: {}", key);
        } catch (IOException e) {
            throw new RuntimeException("Falha ao ler o arquivo para envio ao S3.", e);
        }
    }

    @Override
    public StoredObject getObject(String key) {
        String bucket = properties.getS3().getBucket();
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            ResponseInputStream<GetObjectResponse> inputStream = s3Client.getObject(getObjectRequest);
            String contentType = inputStream.response().contentType();
            if (!StringUtils.hasText(contentType)) {
                contentType = "image/jpeg";
            }
            return new StoredObject(inputStream, contentType, inputStream.response().contentLength());
        } catch (NoSuchKeyException | NoSuchBucketException e) {
            // Fallback for legacy keys if key does not start with files/
            if (!key.startsWith("files/") && !key.startsWith("avatars/")) {
                return getObject("files/" + key);
            }
            return null;
        } catch (Exception e) {
            log.error("Error retrieving object with key '{}' from S3: {}", key, e.getMessage());
            return null;
        }
    }

    @Override
    public void deleteObject(String key) {
        String bucket = properties.getS3().getBucket();
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
            log.info("Deleted S3 object with key: {}", key);
        } catch (Exception e) {
            log.warn("Failed to delete S3 object key '{}': {}", key, e.getMessage());
        }
    }

    private void validateMultipartFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio ou ausente.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("O tamanho máximo permitido para a imagem é 10MB.");
        }
        validateContentType(file.getContentType());
    }

    private void validateContentType(String contentType) {
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo de arquivo inválido. Formatos suportados: JPEG, PNG, WEBP, GIF e SVG.");
        }
    }

    private String normalizeCategory(String category) {
        if (!StringUtils.hasText(category)) {
            return "general";
        }
        String lower = category.trim().toLowerCase();
        if (lower.contains("comp") || lower.contains("logo")) {
            return "company";
        }
        if (lower.contains("prof") || lower.contains("user") || lower.contains("avatar")) {
            return "profile";
        }
        return lower;
    }

    private String resolveFilename(String filename, String contentType) {
        String ext = getFileExtension(filename, contentType);
        if (StringUtils.hasText(filename) && filename.contains(".")) {
            String base = filename.substring(0, filename.lastIndexOf(".")).replaceAll("[^a-zA-Z0-9_-]", "");
            return (StringUtils.hasText(base) ? base : UUID.randomUUID().toString()) + ext;
        }
        return UUID.randomUUID() + ext;
    }

    private String getFileExtension(String filename, String contentType) {
        if (StringUtils.hasText(filename) && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf(".")).toLowerCase();
        }
        if (contentType == null) return ".png";
        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "image/svg+xml" -> ".svg";
            default -> ".jpg";
        };
    }
}
