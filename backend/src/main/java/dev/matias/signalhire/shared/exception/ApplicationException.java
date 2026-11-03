package dev.matias.signalhire.shared.exception;


import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApplicationException extends RuntimeException {

  private final ApplicationExceptionCode errorCode;

  public ApplicationException(ApplicationExceptionCode errorCode, String message) {
    super(message);
    this.errorCode = errorCode;
  }

  public HttpStatus getStatus(){
    return this.errorCode.getStatus();
  }
}
