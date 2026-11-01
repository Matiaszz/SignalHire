package dev.matias.signalhire.shared.infrastructure.storage.impl;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "aws")
public class S3StorageProperties {

    private String region = "us-east-1";
    private String accessKeyId = "test";
    private String secretAccessKey = "test";
    private S3 s3 = new S3();

    @Getter
    @Setter
    public static class S3 {
        private String endpoint = "http://localhost:4566";
        private String bucket = "signalhire-avatars";
        private boolean pathStyleAccess = true;
    }
}
