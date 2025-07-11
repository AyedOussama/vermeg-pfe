package com.pfe2025.ai_processing_service.exception;

public class DocumentFetchException extends RuntimeException {
    public DocumentFetchException(String message, Throwable cause) {
        super(message, cause);
    }
    public DocumentFetchException(String message) {
        super(message);
    }
}
