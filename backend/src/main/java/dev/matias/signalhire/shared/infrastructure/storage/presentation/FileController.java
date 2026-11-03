package dev.matias.signalhire.shared.infrastructure.storage.presentation;

import dev.matias.signalhire.shared.infrastructure.storage.contract.StorageService;
import dev.matias.signalhire.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final StorageService storageService;

    @PostMapping("/presigned-url")
    public ResponseEntity<StorageService.PresignedUploadResponse> getPresignedUrl(
            @Valid @RequestBody FileDTOs.GeneratePresignedUrlRequestDTO request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String ownerId = StringUtils.hasText(request.ownerId())
                ? request.ownerId().trim()
                : (principal != null && principal.getId() != null ? principal.getId().toHexString() : ObjectId.get().toHexString());

        StorageService.PresignedUploadResponse response = storageService.generatePresignedUploadUrl(
                request.category(),
                ownerId,
                request.filename(),
                request.contentType()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category,
            @RequestParam(value = "ownerId", required = false) String ownerId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ObjectId targetId = StringUtils.hasText(ownerId)
                ? (ObjectId.isValid(ownerId) ? new ObjectId(ownerId) : ObjectId.get())
                : (principal != null && principal.getId() != null ? principal.getId() : ObjectId.get());

        String fileUrl;
        if (category.toLowerCase().contains("comp") || category.toLowerCase().contains("logo")) {
            fileUrl = storageService.uploadCompanyLogo(targetId, file);
        } else {
            fileUrl = storageService.uploadAvatar(targetId, file);
        }

        return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
    }

    @PostMapping("/multipart/initiate")
    public ResponseEntity<StorageService.InitiateMultipartResponse> initiateMultipart(
            @Valid @RequestBody FileDTOs.InitiateMultipartRequestDTO request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String ownerId = StringUtils.hasText(request.ownerId())
                ? request.ownerId().trim()
                : (principal != null && principal.getId() != null ? principal.getId().toHexString() : ObjectId.get().toHexString());

        StorageService.InitiateMultipartResponse response = storageService.initiateMultipartUpload(
                request.category(),
                ownerId,
                request.filename(),
                request.contentType()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/multipart/presign-part")
    public ResponseEntity<Map<String, String>> presignPart(
            @Valid @RequestBody FileDTOs.PresignPartRequestDTO request
    ) {
        String uploadPartUrl = storageService.presignUploadPart(
                request.key(),
                request.uploadId(),
                request.partNumber()
        );

        return ResponseEntity.ok(Map.of("uploadUrl", uploadPartUrl, "partNumber", String.valueOf(request.partNumber())));
    }

    @PostMapping("/multipart/complete")
    public ResponseEntity<Map<String, String>> completeMultipart(
            @Valid @RequestBody FileDTOs.CompleteMultipartRequestDTO request
    ) {
        String fileUrl = storageService.completeMultipartUpload(
                request.key(),
                request.uploadId(),
                request.parts()
        );

        return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
    }

    @PostMapping("/multipart/abort")
    public ResponseEntity<Void> abortMultipart(
            @Valid @RequestBody FileDTOs.AbortMultipartRequestDTO request
    ) {
        storageService.abortMultipartUpload(request.key(), request.uploadId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{category}/{ownerId}/{filename}")
    public ResponseEntity<InputStreamResource> getFile(
            @PathVariable String category,
            @PathVariable String ownerId,
            @PathVariable String filename
    ) {
        String key = "files/" + category + "/" + ownerId + "/" + filename;
        StorageService.StoredObject object = storageService.getObject(key);

        if (object == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        HttpHeaders headers = new HttpHeaders();
        try {
            headers.setContentType(MediaType.parseMediaType(object.contentType()));
        } catch (Exception e) {
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        }

        if (object.contentLength() != null && object.contentLength() > 0) {
            headers.setContentLength(object.contentLength());
        }
        headers.setCacheControl("public, max-age=86400");

        return new ResponseEntity<>(new InputStreamResource(object.inputStream()), headers, HttpStatus.OK);
    }
}
