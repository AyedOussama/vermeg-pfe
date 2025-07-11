package com.pfe2025.document_management_service.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(DocumentNotFoundException.class)
    public Mono<ResponseEntity<Map<String, Object>>> handleNotFound(DocumentNotFoundException e) {
        return createErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(InvalidFileException.class)
    public Mono<ResponseEntity<Map<String, Object>>> handleInvalidFile(InvalidFileException e) {
        return createErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(StorageException.class)
    public Mono<ResponseEntity<Map<String, Object>>> handleStorage(StorageException e) {
        log.error("Storage error: ", e);
        return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur de stockage: " + e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<Map<String, Object>>> handleGeneral(Exception e) {
        log.error("Unexpected error: ", e);
        return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne du serveur");
    }

    private Mono<ResponseEntity<Map<String, Object>>> createErrorResponse(HttpStatus status, String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("status", status.value());
        error.put("error", status.getReasonPhrase());
        error.put("message", message);
        error.put("timestamp", System.currentTimeMillis());

        return Mono.just(ResponseEntity.status(status).body(error));
    }
}