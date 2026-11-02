package dev.matias.signalhire.shared.config;

import dev.matias.signalhire.modules.auth.domain.model.RefreshToken;
import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.company.domain.model.Company;
import org.bson.types.ObjectId;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertCallback;

import java.time.Instant;
import java.util.UUID;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    public BeforeConvertCallback<User> userBeforeConvertCallback() {
        return (user, collection) -> {
            if (user.getId() == null) {
                user.setId(ObjectId.get());
            }
            Instant now = Instant.now();
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(now);
            }
            if (user.getUpdatedAt() == null) {
                user.setUpdatedAt(now);
            }
            return user;
        };
    }

    @Bean
    public BeforeConvertCallback<RefreshToken> refreshTokenBeforeConvertCallback() {
        return (token, collection) -> {
            if (token.getId() == null) {
                token.setId(ObjectId.get());
            }
            if (token.getCreatedAt() == null) {
                token.setCreatedAt(Instant.now());
            }
            return token;
        };
    }

    @Bean
    public BeforeConvertCallback<Company> companyBeforeConvertCallback() {
        return (company, collection) -> {
            if (company.getId() == null) {
                company.setId(ObjectId.get());
            }
            return company;
        };
    }
}
