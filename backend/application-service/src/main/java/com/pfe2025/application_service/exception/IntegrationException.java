package com.pfe2025.application_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception lancée lors d'une erreur d'intégration avec un service externe.
 */
@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class IntegrationException extends BaseException {

    private static final String ERROR_CODE = "INTEGRATION_ERROR";

    /**
     * Crée une nouvelle exception d'intégration.
     *
     * @param message Le message d'erreur
     */
    public IntegrationException(String message) {
        super(message, ERROR_CODE);
    }

    /**
     * Crée une nouvelle exception d'intégration avec cause.
     *
     * @param message Le message d'erreur
     * @param cause La cause de l'exception
     */
    public IntegrationException(String message, Throwable cause) {
        super(message, cause, ERROR_CODE);
    }

    /**
     * Crée une nouvelle exception d'intégration avec le service concerné.
     *
     * @param serviceName Le nom du service
     * @param message Le message d'erreur
     * @param cause La cause de l'exception
     */
    public IntegrationException(String serviceName, String message, Throwable cause) {
        super(String.format("Error integrating with %s: %s", serviceName, message), cause, ERROR_CODE);
    }
}