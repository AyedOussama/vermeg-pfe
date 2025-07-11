package com.pfe2025.application_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception lancée lors d'une erreur d'évaluation IA.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class AIEvaluationException extends BaseException {

    private static final String ERROR_CODE = "AI_EVALUATION_ERROR";

    /**
     * Crée une nouvelle exception d'évaluation IA.
     *
     * @param message Le message d'erreur
     */
    public AIEvaluationException(String message) {
        super(message, ERROR_CODE);
    }

    /**
     * Crée une nouvelle exception d'évaluation IA avec cause.
     *
     * @param message Le message d'erreur
     * @param cause La cause de l'exception
     */
    public AIEvaluationException(String message, Throwable cause) {
        super(message, cause, ERROR_CODE);
    }
}