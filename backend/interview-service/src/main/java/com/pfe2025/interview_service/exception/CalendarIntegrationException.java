package com.pfe2025.interview_service.exception;

/**
 * Exception thrown when calendar integration fails.
 */
public class CalendarIntegrationException extends RuntimeException {

    public CalendarIntegrationException(String message) {
        super(message);
    }

    public CalendarIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}