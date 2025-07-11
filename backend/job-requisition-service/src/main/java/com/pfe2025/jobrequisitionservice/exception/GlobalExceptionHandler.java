package com.pfe2025.jobrequisitionservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gestionnaire global des exceptions pour l'API.
 * Intercepte les exceptions et les convertit en réponses HTTP appropriées.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.error("Ressource non trouvée: {}", ex.getMessage());
        return createResponse(HttpStatus.NOT_FOUND, "Ressource non trouvée", ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedException(UnauthorizedException ex) {
        log.error("Accès non autorisé: {}", ex.getMessage());
        return createResponse(HttpStatus.FORBIDDEN, "Accès non autorisé", ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        log.error("Accès refusé: {}", ex.getMessage());
        return createResponse(HttpStatus.FORBIDDEN, "Accès refusé",
                "Vous n'avez pas les autorisations nécessaires pour cette action");
    }

    @ExceptionHandler(StatusTransitionException.class)
    public ResponseEntity<Map<String, Object>> handleStatusTransitionException(StatusTransitionException ex) {
        log.error("Transition de statut invalide: {}", ex.getMessage());
        return createResponse(HttpStatus.BAD_REQUEST, "Transition de statut invalide", ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(IllegalStateException ex) {
        log.error("État illégal: {}", ex.getMessage());
        return createResponse(HttpStatus.BAD_REQUEST, "État illégal", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.error("Erreur de validation: {}", ex.getMessage());

        Map<String, String> errors = ex.getBindingResult().getAllErrors().stream()
                .collect(Collectors.toMap(
                        error -> ((FieldError) error).getField(),
                        error -> error.getDefaultMessage(),
                        (existing, replacement) -> existing
                ));

        Map<String, Object> body = createErrorBody(HttpStatus.BAD_REQUEST, "Erreur de validation", null);
        body.put("errors", errors);

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex) {
        log.error("Erreur non gérée: {}", ex.getMessage(), ex);
        return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur",
                "Une erreur interne est survenue");
    }

    private ResponseEntity<Map<String, Object>> createResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = createErrorBody(status, error, message);
        return new ResponseEntity<>(body, status);
    }

    private Map<String, Object> createErrorBody(HttpStatus status, String error, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        if (message != null) {
            body.put("message", message);
        }
        return body;
    }
}