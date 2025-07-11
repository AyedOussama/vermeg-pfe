package com.pfe2025.ai_processing_service.exception;

public class JsonParsingException extends RuntimeException {
    public JsonParsingException(String message, Throwable cause) {
        super(message, cause);
    }
    public JsonParsingException(String message) {
        super(message);
    }
}
