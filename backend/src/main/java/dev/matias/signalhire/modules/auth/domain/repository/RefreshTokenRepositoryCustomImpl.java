package dev.matias.signalhire.modules.auth.domain.repository;

import dev.matias.signalhire.modules.auth.domain.model.RefreshToken;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RefreshTokenRepositoryCustomImpl implements RefreshTokenRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public void deleteByUserId(ObjectId userId) {
        Query query = new Query(Criteria.where("user.$id").is(userId));
        mongoTemplate.remove(query, RefreshToken.class);
    }

    @Override
    public void revokeFamily(ObjectId familyId, Instant revokedAt) {
        Query query = new Query(Criteria.where("familyId").is(familyId));
        Update update = new Update()
                .set("revoked", true)
                .set("revokedAt", revokedAt);
        mongoTemplate.updateMulti(query, update, RefreshToken.class);
    }
}
