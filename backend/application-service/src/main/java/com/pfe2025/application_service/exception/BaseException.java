package com.pfe2025.application_service.exception;

import lombok.Getter;

/**
 * Exception de base pour toutes les exceptions métier.
 */
@Getter
public abstract class BaseException extends RuntimeException {

    private final String errorCode;

    /**
     * Crée une nouvelle exception avec un message et un code d'erreur.
     *
     * @param message Le message d'erreur
     * @param errorCode Le code d'erreur
     */
    protected BaseException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    /**
     * Crée une nouvelle exception avec un message, une cause et un code d'erreur.
     *
     * @param message Le message d'erreur
     * @param cause La cause de l'exception
     * @param errorCode Le code d'erreur
     */
    protected BaseException(String message, Throwable cause, String errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}