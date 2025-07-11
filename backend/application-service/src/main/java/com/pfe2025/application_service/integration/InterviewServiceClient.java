package com.pfe2025.application_service.integration;

import com.pfe2025.application_service.config.ApplicationProperties;
import com.pfe2025.application_service.dto.InterviewDetailDTO;
import com.pfe2025.application_service.exception.IntegrationException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
@Slf4j
public class InterviewServiceClient {

    private final WebClient webClient;
    private final ApplicationProperties applicationProperties;

    public InterviewServiceClient(@Qualifier("internalServiceWebClientBuilder") WebClient.Builder webClientBuilder,
                                  ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
        this.webClient = webClientBuilder
                .baseUrl(applicationProperties.getIntegration().getInterviewService().getBaseUrl())
                .build();

        log.info("InterviewServiceClient initialized with baseUrl: {}",
                applicationProperties.getIntegration().getInterviewService().getBaseUrl());
    }

    @CircuitBreaker(name = "interviewServiceClient", fallbackMethod = "getInterviewDetailsFallback")
    @Retry(name = "interviewServiceClient")
    public Mono<InterviewDetailDTO> getInterviewDetails(Long interviewId) {
        if (interviewId == null) {
            return Mono.error(new IllegalArgumentException("Interview ID cannot be null"));
        }

        log.debug("Fetching interview details for ID: {}", interviewId);

        return webClient
                .get()
                .uri("/api/internal/interviews/{id}", interviewId)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), response -> {
                    if (response.statusCode() == HttpStatus.NOT_FOUND) {
                        return Mono.error(new IntegrationException("Interview not found with ID: " + interviewId));
                    }
                    return response.bodyToMono(String.class)
                            .map(body -> new IntegrationException(
                                    "Client error when calling Interview Service: " +
                                            response.statusCode() + " - " + body));
                })
                .onStatus(status -> status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new IntegrationException(
                                        "Server error when calling Interview Service: " +
                                                response.statusCode() + " - " + body))
                )
                .bodyToMono(InterviewDetailDTO.class)
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getInterviewService().getTimeoutSeconds()))
                .doOnSuccess(details -> log.debug("Successfully retrieved interview details: {}", interviewId))
                .doOnError(error -> log.error("Error retrieving interview details: {}", interviewId, error))
                .onErrorMap(WebClientResponseException.class, ex -> {
                    if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                        return new IntegrationException("Interview not found with ID: " + interviewId);
                    }
                    return new IntegrationException("Error calling Interview Service: " + ex.getMessage(), ex);
                })
                .onErrorMap(ex -> !(ex instanceof IntegrationException),
                        ex -> new IntegrationException("Unexpected error calling Interview Service", ex));
    }

    @CircuitBreaker(name = "interviewServiceClient", fallbackMethod = "getInterviewByApplicationFallback")
    @Retry(name = "interviewServiceClient")
    public Mono<InterviewDetailDTO> getInterviewByApplication(Long applicationId) {
        if (applicationId == null) {
            return Mono.error(new IllegalArgumentException("Application ID cannot be null"));
        }

        log.debug("Fetching interview for application ID: {}", applicationId);

        return webClient
                .get()
                .uri("/api/internal/interviews/application/{applicationId}", applicationId)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new IntegrationException(
                                        "Error when calling Interview Service: " +
                                                response.statusCode() + " - " + body))
                )
                .bodyToMono(InterviewDetailDTO.class)
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getInterviewService().getTimeoutSeconds()))
                .doOnSuccess(details -> log.debug("Successfully retrieved interview for application: {}", applicationId))
                .doOnError(error -> log.error("Error retrieving interview for application: {}", applicationId, error))
                .onErrorMap(ex -> new IntegrationException("Error retrieving interview for application", ex));
    }

    @CircuitBreaker(name = "interviewServiceClient", fallbackMethod = "requestInterviewFallback")
    @Retry(name = "interviewServiceClient")
    public Mono<Long> requestInterview(InterviewRequestDTO request) {
        if (request == null) {
            return Mono.error(new IllegalArgumentException("Interview request cannot be null"));
        }
        if (request.getApplicationId() == null) {
            return Mono.error(new IllegalArgumentException("Application ID cannot be null"));
        }

        log.debug("Requesting interview for application: {}", request.getApplicationId());

        return webClient
                .post()
                .uri("/api/internal/interviews")
                .bodyValue(request)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new IntegrationException(
                                        "Error when calling Interview Service: " +
                                                response.statusCode() + " - " + body))
                )
                .bodyToMono(InterviewResponseDTO.class)
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getInterviewService().getTimeoutSeconds()))
                .map(InterviewResponseDTO::getInterviewId)
                .doOnSuccess(id -> log.debug("Successfully requested interview with ID: {}", id))
                .doOnError(error -> log.error("Error requesting interview: {}", error.getMessage()))
                .onErrorMap(ex -> new IntegrationException("Error requesting interview", ex));
    }

    // Fallback methods
    private Mono<InterviewDetailDTO> getInterviewDetailsFallback(Long interviewId, Exception ex) {
        log.warn("Fallback for interview details retrieval. ID: {}, Error: {}", interviewId, ex.getMessage());
        return Mono.empty();
    }

    private Mono<InterviewDetailDTO> getInterviewByApplicationFallback(Long applicationId, Exception ex) {
        log.warn("Fallback for interview by application retrieval. Application ID: {}, Error: {}",
                applicationId, ex.getMessage());
        return Mono.empty();
    }

    private Mono<Long> requestInterviewFallback(InterviewRequestDTO request, Exception ex) {
        log.warn("Fallback for interview request. Application ID: {}, Error: {}",
                request.getApplicationId(), ex.getMessage());
        return Mono.error(new IntegrationException("Failed to request interview. Please try again later.", ex));
    }

    @Data
    @Builder
    public static class InterviewRequestDTO {
        private Long applicationId;
        private String applicationReference;
        private String candidateId;
        private String candidateName;
        private Long jobPostingId;
        private String jobTitle;
        private String requestedBy;
    }

    @Data
    @Builder
    public static class InterviewResponseDTO {
        private Long interviewId;
        private String status;
    }
}