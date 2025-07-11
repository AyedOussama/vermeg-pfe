package com.pfe2025.jobpostingservice.exception;



import com.pfe2025.jobpostingservice.model.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

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
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.error("Ressource non trouvée: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.NOT_FOUND, "Ressource non trouvée", ex.getMessage());
    }

    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ErrorResponse> handleInvalidOperationException(InvalidOperationException ex) {
        log.error("Opération invalide: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.BAD_REQUEST, "Opération invalide", ex.getMessage());
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex) {
        log.error("Erreur de validation: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.BAD_REQUEST, "Erreur de validation", ex.getMessage());
    }

    @ExceptionHandler(AuthorizationException.class)
    public ResponseEntity<ErrorResponse> handleAuthorizationException(AuthorizationException ex) {
        log.error("Erreur d'autorisation: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.FORBIDDEN, "Accès refusé", ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
        log.error("Accès refusé: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.FORBIDDEN, "Accès refusé",
                "Vous n'avez pas les autorisations nécessaires pour cette action");
    }

    @ExceptionHandler(StatusTransitionException.class)
    public ResponseEntity<ErrorResponse> handleStatusTransitionException(StatusTransitionException ex) {
        log.error("Transition de statut invalide: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.BAD_REQUEST, "Transition de statut invalide", ex.getMessage());
    }

    @ExceptionHandler(AIServiceException.class)
    public ResponseEntity<ErrorResponse> handleAIServiceException(AIServiceException ex) {
        log.error("Erreur du service d'IA: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.SERVICE_UNAVAILABLE, "Service d'IA non disponible", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.error("Erreur de validation des arguments: {}", ex.getMessage());

        Map<String, String> validationErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        DefaultMessageSourceResolvable::getDefaultMessage,
                        (error1, error2) -> error1
                ));

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Erreur de validation")
                .message("Les données fournies ne sont pas valides")
                .validationErrors(validationErrors)
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.error("Type d'argument incorrect: {}", ex.getMessage());
        String message = String.format("Le paramètre '%s' a une valeur invalide : '%s'",
                ex.getName(), ex.getValue());
        return createErrorResponse(HttpStatus.BAD_REQUEST, "Type d'argument incorrect", message);
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLockingFailureException(OptimisticLockingFailureException ex) {
        log.error("Conflit de version: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.CONFLICT, "Conflit de version",
                "La ressource a été modifiée par un autre utilisateur. Veuillez recharger les données et réessayer.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        log.error("Violation d'intégrité des données: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.CONFLICT, "Violation d'intégrité des données",
                "L'opération ne peut pas être effectuée car elle violerait l'intégrité des données.");
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ErrorResponse> handleResourceAccessException(ResourceAccessException ex) {
        log.error("Erreur d'accès à une ressource externe: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.SERVICE_UNAVAILABLE, "Service externe indisponible",
                "Impossible d'accéder à un service externe nécessaire. Veuillez réessayer plus tard.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        log.error("Erreur non gérée: ", ex);
        return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne du serveur",
                "Une erreur inattendue s'est produite. Veuillez contacter l'administrateur système.");
    }

    private ResponseEntity<ErrorResponse> createErrorResponse(HttpStatus status, String error, String message) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(error)
                .message(message)
                .build();

        return new ResponseEntity<>(errorResponse, status);
    }
}