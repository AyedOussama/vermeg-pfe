package com.PFE2025.user_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when validation fails.
 */
@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Validation Failed")
public class ValidationException extends ServiceException {
    private static final long serialVersionUID = 1L;

    private final transient Object rejectedValue;
    private final String field;

    public ValidationException(String message) {
        super(message, "VALIDATION_FAILED");
        this.rejectedValue = null;
        this.field = null;
    }

    public ValidationException(String message, String field, Object rejectedValue) {
        super(message, "VALIDATION_FAILED");
        this.field = field;
        this.rejectedValue = rejectedValue;
    }

    public ValidationException(String message, Throwable cause) {
        super(message, "VALIDATION_FAILED", cause);
        this.rejectedValue = null;
        this.field = null;
    }

    public Object getRejectedValue() {
        return rejectedValue;
    }

    public String getField() {
        return field;
    }
}
