package com.pfe2025.interview_service.integration;

import com.pfe2025.interview_service.exception.ResourceNotFoundException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Client for communicating with Application Service.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.integration.application-service.base-url}")
    private String baseUrl;

    @Value("${app.integration.application-service.timeout-seconds}")
    private int timeoutSeconds;

    @CircuitBreaker(name = "applicationServiceClient", fallbackMethod = "updateInterviewStatusFallback")
    @Retry(name = "default")
    public Mono<Void> updateInterviewStatus(Long applicationId, Long interviewId, String status) {
        log.debug("Updating interview status for application: {}, interview: {}, status: {}",
                applicationId, interviewId, status);

        return webClientBuilder.build()
                .put()
                .uri(baseUrl + "/api/internal/applications/{applicationId}/interview-status", applicationId)
                .bodyValue(new InterviewStatusUpdate(interviewId, status))
                .retrieve()
                .bodyToMono(Void.class)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .doOnSuccess(v -> log.debug("Successfully updated interview status"))
                .doOnError(error -> log.error("Error updating interview status: {}", error.getMessage()));
    }

    @CircuitBreaker(name = "applicationServiceClient", fallbackMethod = "getApplicationStatusFallback")
    @Retry(name = "default")
    public Mono<String> getApplicationStatus(Long applicationId) {
        log.debug("Getting application status for ID: {}", applicationId);

        return webClientBuilder.build()
                .get()
                .uri(baseUrl + "/api/internal/applications/{applicationId}/status", applicationId)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .doOnSuccess(status -> log.debug("Application status: {}", status))
                .doOnError(error -> log.error("Error getting application status: {}", error.getMessage()));
    }

    // Fallback methods
    private Mono<Void> updateInterviewStatusFallback(Long applicationId, Long interviewId, String status, Exception ex) {
        log.warn("Fallback for updating interview status - Application: {}, Interview: {}, Status: {}",
                applicationId, interviewId, status);
        return Mono.empty();
    }

    private Mono<String> getApplicationStatusFallback(Long applicationId, Exception ex) {
        log.warn("Fallback for getting application status - Application: {}", applicationId);
        return Mono.just("UNKNOWN");
    }

    // Helper classes
    private record InterviewStatusUpdate(Long interviewId, String status) {}
}