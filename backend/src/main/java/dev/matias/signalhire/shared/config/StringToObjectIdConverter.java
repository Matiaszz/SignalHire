package dev.matias.signalhire.shared.config;

import org.bson.types.ObjectId;
import org.jspecify.annotations.NonNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToObjectIdConverter implements Converter<String, ObjectId> {

    @Override
    public ObjectId convert(@NonNull String source) {
        if (source.isBlank()) {
            return null;
        }
        return new ObjectId(source);
    }
}
