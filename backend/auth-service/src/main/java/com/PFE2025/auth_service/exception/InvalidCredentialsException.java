package com.PFE2025.auth_service.exception;

public class InvalidCredentialsException extends BaseException {
    public InvalidCredentialsException(String message) {
        super(message);
    }

    public InvalidCredentialsException(String message, Throwable cause) {
        super(message, cause);
    }
}