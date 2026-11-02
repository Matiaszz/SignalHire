package dev.matias.signalhire.modules.auth.domain.repository;

import dev.matias.signalhire.modules.auth.domain.model.RefreshToken;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, ObjectId>, RefreshTokenRepositoryCustom {

    Optional<RefreshToken> findByTokenHash(String tokenHash);
}
