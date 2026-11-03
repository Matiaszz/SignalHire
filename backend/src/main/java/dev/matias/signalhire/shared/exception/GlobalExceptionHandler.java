package dev.matias.signalhire.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ApiErrorResponse> handleApplicationException(ApplicationException ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Violação de Regra de Negócio")
                .message(ex.getMessage())
                .code(ex.getErrorCode())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(ex.getStatus()).body(response);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Violação de Regra de Negócio")
                .message(ex.getMessage())
                .code(ex.getCode())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(ex.getCode().getStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ApplicationExceptionCode code = ApplicationExceptionCode.VALIDATION_FAILED;
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(code.getStatusValue())
                .error("Dados Inválidos")
                .message("Erro de validação nos campos informados.")
                .code(code)
                .path(request.getRequestURI())
                .errors(errors)
                .build();

        return ResponseEntity.status(code.getStatus()).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        ApplicationExceptionCode code = ApplicationExceptionCode.INVALID_CREDENTIALS;
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(code.getStatusValue())
                .error("Não Autorizado")
                .message(ex.getMessage())
                .code(code)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(code.getStatus()).body(response);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(NoSuchElementException ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(ApplicationExceptionCode.RESOURCE_NOT_FOUND.getStatus().value())
                .error("Não Encontrado")
                .message(ex.getMessage())
                .code(ApplicationExceptionCode.RESOURCE_NOT_FOUND)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(ApplicationExceptionCode.RESOURCE_NOT_FOUND.getStatus()).body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxSize(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        ApplicationExceptionCode code = ApplicationExceptionCode.FILE_TOO_LARGE;
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(code.getStatusValue())
                .error("Arquivo Muito Grande")
                .message("O arquivo enviado excede o limite máximo permitido de 10MB.")
                .code(code)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(code.getStatus()).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Requisição Inválida")
                .message(ex.getMessage())
                .code(ApplicationExceptionCode.BAD_REQUEST)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Erro interno inesperado no endpoint {}", request.getRequestURI(), ex);
        ApplicationExceptionCode code = ApplicationExceptionCode.INTERNAL_ERROR;
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Erro Interno do Servidor")
                .message("Ocorreu um erro interno inesperado. Tente novamente mais tarde.")
                .code(code)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
