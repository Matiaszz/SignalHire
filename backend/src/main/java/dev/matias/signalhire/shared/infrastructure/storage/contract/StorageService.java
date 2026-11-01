package dev.matias.signalhire.shared.infrastructure.storage.contract;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

public interface StorageService {

    String uploadAvatar(UUID userId, MultipartFile file);

    StoredObject getObject(String key);

    void deleteObject(String key);

    record StoredObject(InputStream inputStream, String contentType, Long contentLength) {}
}
