package com.PFE2025.user_service.exception;

/**
 * Base exception class for all service exceptions.
 * Provides common functionality for service-specific exceptions.
 */
public abstract class ServiceException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private final String errorCode;

    public ServiceException(String message) {
        super(message);
        this.errorCode = this.getClass().getSimpleName().toUpperCase();
    }

    public ServiceException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = this.getClass().getSimpleName().toUpperCase();
    }

    public ServiceException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public ServiceException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return this.errorCode;
    }
}
