package com.PFE2025.Api_Gateway.fallback;



import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/fallback")
@Slf4j
public class FallbackController {

    @GetMapping("/auth")
    public ResponseEntity<Map<String, Object>> authServiceFallback() {
        log.warn("Auth service circuit breaker activated");
        return buildErrorResponse(
                "Authentication Service Unavailable",
                "The authentication service is temporarily unavailable. Please try again later.",
                "AUTH_SERVICE_DOWN"
        );
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        log.warn("User service circuit breaker activated");
        return buildErrorResponse(
                "User Service Unavailable",
                "The user management service is temporarily unavailable. Please try again later.",
                "USER_SERVICE_DOWN"
        );
    }

    @GetMapping("/candidate")
    public ResponseEntity<Map<String, Object>> candidateServiceFallback() {
        log.warn("Candidate service circuit breaker activated");
        return buildErrorResponse(
                "Candidate Service Unavailable",
                "The candidate service is temporarily unavailable. Please try again later.",
                "CANDIDATE_SERVICE_DOWN"
        );
    }

    @GetMapping("/job")
    public ResponseEntity<Map<String, Object>> jobServiceFallback() {
        log.warn("Job service circuit breaker activated");
        return buildErrorResponse(
                "Job Service Unavailable",
                "The job management service is temporarily unavailable. Please try again later.",
                "JOB_SERVICE_DOWN"
        );
    }

    @GetMapping("/document")
    public ResponseEntity<Map<String, Object>> documentServiceFallback() {
        log.warn("Document service circuit breaker activated");
        return buildErrorResponse(
                "Document Service Unavailable",
                "The document management service is temporarily unavailable. Please try again later.",
                "DOCUMENT_SERVICE_DOWN"
        );
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(String error, String message, String code) {
        Map<String, Object> response = Map.of(
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "error", error,
                "message", message,
                "code", code,
                "timestamp", System.currentTimeMillis()
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}