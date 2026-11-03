package dev.matias.signalhire.shared.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final ApplicationExceptionCode code;

    public BusinessException(String message) {
        super(message);
        this.code = ApplicationExceptionCode.BUSINESS_RULE_VIOLATION;
    }

    public BusinessException(String message, ApplicationExceptionCode code) {
        super(message);
        this.code = code;
    }
}
