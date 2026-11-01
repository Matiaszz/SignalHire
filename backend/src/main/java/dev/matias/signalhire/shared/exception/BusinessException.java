package dev.matias.signalhire.shared.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final String code;

    public BusinessException(String message) {
        super(message);
        this.code = "BUSINESS_RULE_VIOLATION";
    }

    public BusinessException(String message, String code) {
        super(message);
        this.code = code;
    }
}
