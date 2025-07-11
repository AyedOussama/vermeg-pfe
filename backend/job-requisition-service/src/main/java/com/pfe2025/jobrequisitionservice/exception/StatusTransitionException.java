package com.pfe2025.jobrequisitionservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsqu'une transition de statut non autorisée est tentée.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class StatusTransitionException extends RuntimeException {

    public StatusTransitionException(String message) {
        super(message);
    }

    public StatusTransitionException(String message, Throwable cause) {
        super(message, cause);
    }
}