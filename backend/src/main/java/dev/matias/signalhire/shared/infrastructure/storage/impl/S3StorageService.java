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
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "s3", matchIfMissing = true)
public class S3StorageService implements StorageService {

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final S3Client s3Client;
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
        } catch (NoSuchBucketException e) {
            log.info("S3 Bucket '{}' does not exist. Creating it...", bucket);
            createBucket(bucket);
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

    @Override
    public String uploadAvatar(ObjectId userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de foto de perfil vazio ou ausente.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("O tamanho máximo permitido para a foto de perfil é 10MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo de arquivo inválido. Formatos suportados: JPEG, PNG, WEBP e GIF.");
        }

        ensureBucketExists();

        String rawOriginalFilename = file.getOriginalFilename();
        String extension = getFileExtension(rawOriginalFilename, contentType);
        String filename = UUID.randomUUID() + extension;
        String key = "avatars/" + userId + "/" + filename;

        String bucket = properties.getS3().getBucket();

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("Uploaded avatar to S3 key: {}", key);

            return "/api/avatars/" + userId + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Falha ao ler o conteúdo do arquivo para upload S3.", e);
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
            return null;
        } catch (Exception e) {
            log.error("Error retrieving avatar with key '{}' from S3: {}", key, e.getMessage());
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

    private String getFileExtension(String filename, String contentType) {
        if (StringUtils.hasText(filename) && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf(".")).toLowerCase();
        }
        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
