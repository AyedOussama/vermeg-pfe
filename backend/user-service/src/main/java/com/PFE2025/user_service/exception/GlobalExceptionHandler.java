package com.PFE2025.user_service.exception;

import com.PFE2025.user_service.dto.response.ApiError;
import feign.FeignException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.io.EOFException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<ApiError> handleServiceException(ServiceException ex, WebRequest request) {
        String path = extractPath(request);
        log.error("Service exception: {} at path: {}", ex.getMessage(), path, ex);

        HttpStatus status = determineStatusForServiceException(ex);

        ApiError apiError = ApiError.builder()
                .status(status.value())
                .message(ex.getMessage())
                .path(path)
                .errorCode(ex.getErrorCode())
                .timestamp(LocalDateTime.now())
                .build();

        if (ex instanceof ValidationException) {
            ValidationException validationEx = (ValidationException) ex;
            if (validationEx.getField() != null) {
                Map<String, Object> details = new HashMap<>();
                details.put("field", validationEx.getField());
                details.put("rejectedValue", validationEx.getRejectedValue());
                apiError.setDetails(details);
            }
        }

        return new ResponseEntity<>(apiError, status);
    }

    private HttpStatus determineStatusForServiceException(ServiceException ex) {
        if (ex instanceof ResourceNotFoundException) {
            return HttpStatus.NOT_FOUND;
        } else if (ex instanceof ResourceAlreadyExistsException) {
            return HttpStatus.CONFLICT;
        } else if (ex instanceof ValidationException) {
            return HttpStatus.BAD_REQUEST;
        } else if (ex instanceof AuthenticationFailedException) {
            return HttpStatus.UNAUTHORIZED;
        } else if (ex instanceof ServiceUnavailableException) {
            return HttpStatus.SERVICE_UNAVAILABLE;
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        String path = extractPath(request);
        String requestId = generateRequestId();
        log.warn("Validation exception at path: {} [RequestID: {}]", path, requestId);

        Map<String, Object> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Request validation failed. Please check the provided data.")
                .errorCode("VALIDATION_ERROR")
                .timestamp(LocalDateTime.now())
                .path(path)
                .details(errors)
                .build();

        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex, WebRequest request) {
        String path = extractPath(request);
        String requestId = generateRequestId();
        log.warn("Constraint violation at path: {} [RequestID: {}]", path, requestId);

        Map<String, Object> errors = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        }

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Data validation constraints violated. Please verify your input.")
                .errorCode("CONSTRAINT_VIOLATION")
                .timestamp(LocalDateTime.now())
                .path(path)
                .details(errors)
                .build();

        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(WebExchangeBindException.class)
    public ResponseEntity<ApiError> handleWebExchangeBindException(WebExchangeBindException ex, WebRequest request) {
        String path = extractPath(request);
        log.warn("WebExchangeBindException at path: {}", path);

        Map<String, Object> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (existing, replacement) -> existing + ", " + replacement
                ));

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Validation failed")
                .errorCode("VALIDATION_ERROR")
                .timestamp(LocalDateTime.now())
                .path(path)
                .details(errors)
                .build();

        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        String path = extractPath(request);
        log.warn("Method argument type mismatch at path: {}", path);

        String message = String.format("Invalid parameter '%s': expected type %s but received %s",
                ex.getName(), ex.getRequiredType().getSimpleName(), ex.getValue());

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(message)
                .errorCode("TYPE_MISMATCH")
                .timestamp(LocalDateTime.now())
                .path(path)
                .build();

        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatusException(ResponseStatusException ex, WebRequest request) {
        String path = extractPath(request);
        log.error("Response status exception: {} at path: {}", ex.getMessage(), path);

        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());

        ApiError apiError = ApiError.builder()
                .status(status.value())
                .message(ex.getReason())
                .errorCode("HTTP_" + status.value())
                .timestamp(LocalDateTime.now())
                .path(path)
                .build();

        return new ResponseEntity<>(apiError, status);
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ApiError> handleFeignException(FeignException ex, WebRequest request) {
        String path = extractPath(request);
        String requestId = generateRequestId();
        log.error("Feign exception: {} at path: {} [RequestID: {}]", ex.getMessage(), path, requestId);

        HttpStatus status;
        String message;
        String errorCode;

        if (ex.status() == HttpStatus.CONFLICT.value() && ex.contentUTF8().contains("User exists with same email")) {
            status = HttpStatus.CONFLICT;
            message = "A user with this email address already exists";
            errorCode = "USER_ALREADY_EXISTS";
        } else if (ex.status() == 0) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = "Authentication service is currently unavailable. Please try again later.";
            errorCode = "AUTH_SERVICE_UNAVAILABLE";
        } else if (ex.status() >= 500) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = "Authentication service is temporarily unavailable. Please try again later.";
            errorCode = "AUTH_SERVICE_ERROR";
        } else if (ex.status() == HttpStatus.UNAUTHORIZED.value()) {
            status = HttpStatus.UNAUTHORIZED;
            message = "Invalid authentication credentials for accessing the authentication service.";
            errorCode = "AUTH_SERVICE_UNAUTHORIZED";
        } else if (ex.status() == HttpStatus.NOT_FOUND.value()) {
            status = HttpStatus.NOT_FOUND;
            message = "Resource not found in the authentication service.";
            errorCode = "AUTH_RESOURCE_NOT_FOUND";
        } else {
            status = HttpStatus.valueOf(ex.status() != 0 ? ex.status() : 500);
            message = String.format("Error communicating with authentication service: %s", ex.getMessage());
            errorCode = "AUTH_SERVICE_ERROR";
        }

        Map<String, Object> details = new HashMap<>();
        details.put("requestId", requestId);
        details.put("serviceStatus", ex.status());

        ApiError apiError = ApiError.builder()
                .status(status.value())
                .message(message)
                .errorCode(errorCode)
                .timestamp(LocalDateTime.now())
                .path(path)
                .details(details)
                .build();

        return new ResponseEntity<>(apiError, status);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        String path = extractPath(request);
        String requestId = generateRequestId();
        log.warn("Access denied exception at path: {} [RequestID: {}]", path, requestId);

        Map<String, Object> details = new HashMap<>();
        details.put("requestId", requestId);

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.FORBIDDEN.value())
                .message("Access denied: You do not have the necessary permissions to access this resource")
                .errorCode("ACCESS_DENIED")
                .timestamp(LocalDateTime.now())
                .path(path)
                .details(details)
                .build();

        return new ResponseEntity<>(apiError, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, WebRequest request) {
        String path = extractPath(request);
        String requestId = generateRequestId();
        String errorMessage;
        String errorCode;

        if (ex.getCause() != null && ex.getCause().getCause() instanceof EOFException) {
            errorMessage = "Connection was interrupted before the complete request was received";
            errorCode = "INCOMPLETE_REQUEST";
            log.warn("Client connection interrupted during request reading at path: {} [RequestID: {}]", path, requestId);
        } else if (ex.getMessage() != null && ex.getMessage().contains("Required request body is missing")) {
            errorMessage = "Request body is missing";
            errorCode = "MISSING_REQUEST_BODY";
            log.warn("Missing request body at path: {} [RequestID: {}]", path, requestId);
        } else {
            errorMessage = "Invalid or incompatible request format";
            errorCode = "INVALID_REQUEST_FORMAT";
            log.error("Request deserialization error at path: {} [RequestID: {}]", path, requestId, ex);
        }

        Map<String, Object> details = new HashMap<>();
        details.put("requestId", requestId);

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(errorMessage)
                .errorCode(errorCode)
                .timestamp(LocalDateTime.now())
                .path(path)
                .details(details)
                .build();

        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    // New handler for NoResourceFoundException (404 errors)
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> handleNoResourceFound(NoResourceFoundException ex, WebRequest request) {
        String path = extractPath(request);
        String requestId = generateRequestId();
        log.warn("Resource not found at path: {} [RequestID: {}]", path, requestId);

        Map<String, Object> details = new HashMap<>();
        details.put("requestId", requestId);
        details.put("resourcePath", ex.getResourcePath());

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message("The requested resource was not found")
                .errorCode("RESOURCE_NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .path(path)
                .details(details)
                .build();

        return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
    }

    // New handler for Authentication exceptions
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        String path = extractPath(request);
        String requestId = generateRequestId();
        log.warn("Authentication exception at path: {} [RequestID: {}]", path, requestId);

        Map<String, Object> details = new HashMap<>();
        details.put("requestId", requestId);

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Authentication failed: Invalid credentials or token")
                .errorCode("AUTHENTICATION_FAILED")
                .timestamp(LocalDateTime.now())
                .path(path)
                .details(details)
                .build();

        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGlobalException(Exception ex, WebRequest request) {
        String path = extractPath(request);
        String requestId = generateRequestId();
        log.error("Unhandled exception at path: {} [RequestID: {}]", path, requestId, ex);

        Map<String, Object> details = new HashMap<>();
        details.put("requestId", requestId);
        details.put("exceptionType", ex.getClass().getSimpleName());

        ApiError apiError = ApiError.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("An internal error occurred. Please try again later or contact support.")
                .errorCode("INTERNAL_ERROR")
                .timestamp(LocalDateTime.now())
                .path(path)
                .details(details)
                .build();

        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String generateRequestId() {
        return java.util.UUID.randomUUID().toString().substring(0, 8);
    }

    private String extractPath(WebRequest request) {
        if (request instanceof ServletWebRequest) {
            return ((ServletWebRequest) request).getRequest().getRequestURI();
        }
        return request.getDescription(false);
    }
}