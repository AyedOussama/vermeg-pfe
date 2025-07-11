package com.pfe2025.application_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception lancée lorsqu'une opération demandée est invalide.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidOperationException extends BaseException {

    private static final String ERROR_CODE = "INVALID_OPERATION";

    /**
     * Crée une nouvelle exception d'opération invalide.
     *
     * @param message Le message d'erreur
     */
    public InvalidOperationException(String message) {
        super(message, ERROR_CODE);
    }

    /**
     * Crée une nouvelle exception d'opération invalide avec cause.
     *
     * @param message Le message d'erreur
     * @param cause La cause de l'exception
     */
    public InvalidOperationException(String message, Throwable cause) {
        super(message, cause, ERROR_CODE);
    }
}