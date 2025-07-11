package com.PFE2025.auth_service.exception;

import com.PFE2025.auth_service.dto.response.ApiError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalErrorHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Mono<ResponseEntity<ApiError>> handleInvalidCredentials(InvalidCredentialsException e, ServerWebExchange exchange) {
        String requestId = generateRequestId();
        String path = exchange.getRequest().getPath().value();
        log.warn("Invalid credentials at path: {} [RequestID: {}] - {}", path, requestId, e.getMessage());

        Map<String, Object> details = new HashMap<>();
        details.put("requestId", requestId);

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Authentication failed: Invalid email or password")
                .errorCode("INVALID_CREDENTIALS")
                .path(path)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();

        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(apiError));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Mono<ResponseEntity<ApiError>> handleResourceNotFound(ResourceNotFoundException e, ServerWebExchange exchange) {
        String requestId = generateRequestId();
        String path = exchange.getRequest().getPath().value();
        log.warn("Resource not found at path: {} [RequestID: {}] - {}", path, requestId, e.getMessage());

        Map<String, Object> details = new HashMap<>();
        details.put("requestId", requestId);

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message("The requested resource was not found")
                .errorCode("RESOURCE_NOT_FOUND")
                .path(path)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();

        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiError));
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Mono<ResponseEntity<ApiError>> handleUserAlreadyExists(UserAlreadyExistsException e, ServerWebExchange exchange) {
        String requestId = generateRequestId();
        String path = exchange.getRequest().getPath().value();
        log.warn("User already exists at path: {} [RequestID: {}] - {}", path, requestId, e.getMessage());

        Map<String, Object> details = new HashMap<>();
        details.put("requestId", requestId);

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.CONFLICT.value())
                .message("A user with this email address already exists")
                .errorCode("USER_ALREADY_EXISTS")
                .path(path)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();

        return Mono.just(ResponseEntity.status(HttpStatus.CONFLICT).body(apiError));
    }

    @ExceptionHandler(InvalidTokenException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Mono<ResponseEntity<Map<String, Object>>> handleInvalidToken(InvalidTokenException e) {
        log.warn("Invalid token: {}", e.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "Invalid token",
                        "message", e.getMessage(),
                        "timestamp", System.currentTimeMillis()
                )));
    }

    @ExceptionHandler(KeycloakException.class)
    @ResponseStatus(HttpStatus.BAD_GATEWAY)
    public Mono<ResponseEntity<Map<String, Object>>> handleKeycloakException(KeycloakException e) {
        log.error("Keycloak error: {}", e.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of(
                        "error", "Authentication service error",
                        "message", "An error occurred with the authentication service",
                        "timestamp", System.currentTimeMillis()
                )));
    }

    @ExceptionHandler(WebClientResponseException.class)
    @ResponseStatus(HttpStatus.BAD_GATEWAY)
    public Mono<ResponseEntity<Map<String, Object>>> handleWebClientException(WebClientResponseException e) {
        log.error("WebClient error: {} - {}", e.getStatusCode(), e.getMessage());

        HttpStatus status = HttpStatus.BAD_GATEWAY;
        String message = "External service error";

        if (e.getStatusCode().equals(HttpStatus.UNAUTHORIZED)) {
            status = HttpStatus.UNAUTHORIZED;
            message = "Authentication failed";
        } else if (e.getStatusCode().equals(HttpStatus.NOT_FOUND)) {
            status = HttpStatus.NOT_FOUND;
            message = "Resource not found";
        }

        return Mono.just(ResponseEntity.status(status)
                .body(Map.of(
                        "error", message,
                        "message", "An error occurred while communicating with external service",
                        "timestamp", System.currentTimeMillis()
                )));
    }

    @ExceptionHandler(WebExchangeBindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Mono<ResponseEntity<Map<String, Object>>> handleValidationErrors(WebExchangeBindException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation failed: {}", errors);

        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "Validation failed",
                        "errors", errors,
                        "timestamp", System.currentTimeMillis()
                )));
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Mono<ResponseEntity<ApiError>> handleGenericError(Exception e, ServerWebExchange exchange) {
        String requestId = generateRequestId();
        String path = exchange.getRequest().getPath().value();
        log.error("Unexpected error at path: {} [RequestID: {}]", path, requestId, e);

        Map<String, Object> details = new HashMap<>();
        details.put("requestId", requestId);
        details.put("exceptionType", e.getClass().getSimpleName());

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("An internal error occurred. Please try again later or contact support.")
                .errorCode("INTERNAL_ERROR")
                .path(path)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();

        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiError));
    }

    private String generateRequestId() {
        return java.util.UUID.randomUUID().toString().substring(0, 8);
    }
}