package dev.matias.signalhire.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;

@Getter
public enum ApplicationExceptionCode {
    FORBIDDEN_ACTION(FORBIDDEN),
    BAD_REQUEST(HttpStatus.BAD_REQUEST),
    BUSINESS_RULE_VIOLATION(HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(UNAUTHORIZED),
    RESOURCE_NOT_FOUND(NOT_FOUND),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST),
    INTERNAL_ERROR(INTERNAL_SERVER_ERROR),
    FILE_TOO_LARGE(CONTENT_TOO_LARGE),
    EMAIL_ALREADY_EXISTS(CONFLICT);

    private final HttpStatus status;

    ApplicationExceptionCode(HttpStatus status){
        this.status = status;
    }

    public int getStatusValue(){
        return this.status.value();
    }
}
