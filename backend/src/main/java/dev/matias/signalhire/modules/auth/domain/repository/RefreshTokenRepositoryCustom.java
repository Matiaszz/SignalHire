package dev.matias.signalhire.modules.auth.domain.repository;

import org.bson.types.ObjectId;

import java.time.Instant;
import java.util.UUID;

public interface RefreshTokenRepositoryCustom {

    void deleteByUserId(ObjectId userId);

    void revokeFamily(ObjectId familyId, Instant revokedAt);
}
