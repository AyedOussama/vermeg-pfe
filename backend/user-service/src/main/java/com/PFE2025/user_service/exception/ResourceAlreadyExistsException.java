package com.PFE2025.user_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a resource already exists.
 */
@ResponseStatus(value = HttpStatus.CONFLICT, reason = "Resource Already Exists")
public class ResourceAlreadyExistsException extends ServiceException {
    private static final long serialVersionUID = 1L;

    public ResourceAlreadyExistsException(String message) {
        super(message, "RESOURCE_ALREADY_EXISTS");
    }

    public ResourceAlreadyExistsException(String message, Throwable cause) {
        super(message, "RESOURCE_ALREADY_EXISTS", cause);
    }
}
