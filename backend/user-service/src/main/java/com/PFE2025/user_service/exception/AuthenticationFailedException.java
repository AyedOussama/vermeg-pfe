package com.PFE2025.user_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when authentication fails.
 */
@ResponseStatus(value = HttpStatus.UNAUTHORIZED, reason = "Authentication Failed")
public class AuthenticationFailedException extends ServiceException {
    private static final long serialVersionUID = 1L;

    public AuthenticationFailedException(String message) {
        super(message, "AUTHENTICATION_FAILED");
    }

    public AuthenticationFailedException(String message, Throwable cause) {
        super(message, "AUTHENTICATION_FAILED", cause);
    }
}