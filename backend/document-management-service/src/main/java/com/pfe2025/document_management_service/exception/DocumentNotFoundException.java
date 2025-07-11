package com.pfe2025.document_management_service.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class DocumentNotFoundException extends RuntimeException {
    public DocumentNotFoundException(Long id) {
        super("Document non trouvé avec l'ID: " + id);
    }

    public DocumentNotFoundException(String message) {
        super(message);
    }
}