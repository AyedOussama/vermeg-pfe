package com.PFE2025.auth_service.exception;

public class KeycloakException extends BaseException {
    public KeycloakException(String message) {
        super(message);
    }

    public KeycloakException(String message, Throwable cause) {
        super(message, cause);
    }
}