package com.pfe2025.document_management_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Exception spécifique pour les erreurs lors de la publication d'événements.
 */
public class EventPublishingException extends ResponseStatusException {
    public EventPublishingException(String message, Throwable cause) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, message, cause);
    }
}
