package dev.matias.signalhire.modules.auth.presentation.controller;

import dev.matias.signalhire.shared.infrastructure.storage.contract.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/avatars")
@RequiredArgsConstructor
public class AvatarController {

    private final StorageService storageService;

    @GetMapping("/{userId}/{filename}")
    public ResponseEntity<InputStreamResource> getAvatar(
            @PathVariable UUID userId,
            @PathVariable String filename
    ) {
        String key = "avatars/" + userId + "/" + filename;
        StorageService.StoredObject object = storageService.getObject(key);

        if (object == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(object.contentType()));
        if (object.contentLength() != null && object.contentLength() > 0) {
            headers.setContentLength(object.contentLength());
        }
        headers.setCacheControl("public, max-age=86400");

        return new ResponseEntity<>(new InputStreamResource(object.inputStream()), headers, HttpStatus.OK);
    }
}
