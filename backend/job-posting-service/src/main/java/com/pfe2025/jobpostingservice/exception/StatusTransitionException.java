package com.pfe2025.jobpostingservice.exception;



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

    public StatusTransitionException(String currentStatus, String targetStatus) {
        super(String.format("Transition de statut non autorisée : de %s vers %s", currentStatus, targetStatus));
    }
}
