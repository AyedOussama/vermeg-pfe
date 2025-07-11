package com.PFE2025.user_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a remote service is unavailable.
 */
@ResponseStatus(value = HttpStatus.SERVICE_UNAVAILABLE, reason = "Service Unavailable")
public class ServiceUnavailableException extends ServiceException {
    private static final long serialVersionUID = 1L;

    public ServiceUnavailableException(String message) {
        super(message, "SERVICE_UNAVAILABLE");
    }

    public ServiceUnavailableException(String message, Throwable cause) {
        super(message, "SERVICE_UNAVAILABLE", cause);
    }
}
