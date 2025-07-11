package com.pfe2025.ai_processing_service.exception;

public class AiApiException extends RuntimeException {
    public AiApiException(String message, Throwable cause) {
        super(message, cause);
    }
    public AiApiException(String message) {
        super(message);
    }
}
