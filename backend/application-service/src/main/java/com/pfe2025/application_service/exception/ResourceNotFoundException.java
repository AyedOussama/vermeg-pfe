package com.pfe2025.application_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception lancée lorsqu'une ressource n'est pas trouvée.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends BaseException {

    private static final String ERROR_CODE = "RESOURCE_NOT_FOUND";

    /**
     * Crée une nouvelle exception de ressource non trouvée.
     *
     * @param message Le message d'erreur
     */
    public ResourceNotFoundException(String message) {
        super(message, ERROR_CODE);
    }

    /**
     * Crée une nouvelle exception de ressource non trouvée avec identifiant.
     *
     * @param resourceName Le nom de la ressource
     * @param fieldName Le nom du champ d'identification
     * @param fieldValue La valeur du champ d'identification
     */
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s : '%s'", resourceName, fieldName, fieldValue), ERROR_CODE);
    }
}