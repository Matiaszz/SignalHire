package dev.matias.signalhire.shared.config;

import dev.matias.signalhire.shared.exception.ApplicationException;
import dev.matias.signalhire.shared.exception.ApplicationExceptionCode;
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
        if (!ObjectId.isValid(source)) {
            throw new ApplicationException(ApplicationExceptionCode.RESOURCE_NOT_FOUND, "Recurso não encontrado.");
        }
        return new ObjectId(source);
    }
}
