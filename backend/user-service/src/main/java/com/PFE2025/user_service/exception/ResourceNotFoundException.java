package com.PFE2025.user_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a requested resource is not found.
 */
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "Resource Not Found")
public class ResourceNotFoundException extends ServiceException {
    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND");
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, "RESOURCE_NOT_FOUND", cause);
    }

    public static ResourceNotFoundException withId(String resourceType, Object id) {
        return new ResourceNotFoundException(resourceType + " not found with id: " + id);
    }
}