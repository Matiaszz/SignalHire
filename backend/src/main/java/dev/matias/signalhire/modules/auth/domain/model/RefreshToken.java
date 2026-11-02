package dev.matias.signalhire.modules.auth.domain.model;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "refresh_tokens")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RefreshToken {

    @Id
    @EqualsAndHashCode.Include
    @Builder.Default
    private ObjectId id = ObjectId.get();

    @DocumentReference
    private User user;

    @Indexed(unique = true)
    private String tokenHash;

    @Indexed
    private ObjectId familyId;

    @Field("expires_at")
    private Instant expiresAt;

    @Builder.Default
    private boolean revoked = false;

    private Instant revokedAt;

    private String replacedByTokenHash;

    private String userAgent;

    private String ipAddress;

    @CreatedDate
    private Instant createdAt;

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !revoked && !isExpired();
    }

    public void revoke(String replacedBy) {
        this.revoked = true;
        this.revokedAt = Instant.now();
        this.replacedByTokenHash = replacedBy;
    }
}
