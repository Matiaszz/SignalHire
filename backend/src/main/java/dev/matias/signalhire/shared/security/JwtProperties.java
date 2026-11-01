package dev.matias.signalhire.shared.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.security.jwt")
public class JwtProperties {

    private String secret = "c2lnbmFsaGlyZS1zdXBlci1zZWNyZXQta2V5LWZvci1qd3QtaHMAC256LTI1Ni1iaXRzLW1pbmltdW0tMjAyNg==";
    private long accessExpirationMs = 900000;
    private long refreshExpirationMs = 604800000;
    private String cookieName = "signalhire_refresh_token";
    private boolean cookieSecure = false;
    private String cookieSameSite = "Lax";
}
