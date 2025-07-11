package com.pfe2025.ai_processing_service.exception;

public class PdfParsingException extends RuntimeException {
    public PdfParsingException(String message, Throwable cause) {
        super(message, cause);
    }
    public PdfParsingException(String message) {
        super(message);
    }
}
