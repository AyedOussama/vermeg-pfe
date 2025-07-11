package com.pfe2025.application_service.integration;

import com.pfe2025.application_service.config.ApplicationProperties;
import com.pfe2025.application_service.dto.JobPostingDTO;
import com.pfe2025.application_service.exception.IntegrationException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@Component
@Slf4j
public class JobPostingServiceClient {

    private final WebClient webClient;
    private final ApplicationProperties applicationProperties;

    public JobPostingServiceClient(@Qualifier("internalServiceWebClientBuilder") WebClient.Builder webClientBuilder,
                                   ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
        this.webClient = webClientBuilder
                .baseUrl(applicationProperties.getIntegration().getJobPostingService().getBaseUrl())
                .build();

        log.info("JobPostingServiceClient initialized with baseUrl: {}",
                applicationProperties.getIntegration().getJobPostingService().getBaseUrl());
    }

    @Cacheable(value = "jobPostings", key = "#jobPostingId", unless = "#result == null")
    @CircuitBreaker(name = "jobPostingServiceClient", fallbackMethod = "getJobPostingFallback")
    @Retry(name = "jobPostingServiceClient")
    public Mono<JobPostingDTO> getJobPosting(Long jobPostingId) {
        if (jobPostingId == null) {
            return Mono.error(new IllegalArgumentException("Job posting ID cannot be null"));
        }

        log.debug("Fetching job posting with ID: {}", jobPostingId);

        return webClient
                .get()
                .uri("/api/job-postings/{id}", jobPostingId)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), response -> {
                    if (response.statusCode() == HttpStatus.NOT_FOUND) {
                        return Mono.error(new IntegrationException("Job posting not found for ID: " + jobPostingId));
                    }
                    return response.bodyToMono(String.class)
                            .map(body -> new IntegrationException(
                                    "Client error when calling Job Posting Service: " +
                                            response.statusCode() + " - " + body));
                })
                .onStatus(status -> status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new IntegrationException(
                                        "Server error when calling Job Posting Service: " +
                                                response.statusCode() + " - " + body))
                )
                .bodyToMono(JobPostingDTO.class)
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getJobPostingService().getTimeoutSeconds()))
                .doOnSuccess(job -> log.debug("Successfully retrieved job posting: {}", jobPostingId))
                .doOnError(error -> log.error("Error retrieving job posting: {}", jobPostingId, error))
                .onErrorMap(WebClientResponseException.class, ex -> {
                    if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                        return new IntegrationException("Job posting not found for ID: " + jobPostingId);
                    }
                    return new IntegrationException("Error calling Job Posting Service: " + ex.getMessage(), ex);
                })
                .onErrorMap(ex -> !(ex instanceof IntegrationException),
                        ex -> new IntegrationException("Unexpected error calling Job Posting Service", ex));
    }

    @Cacheable(value = "activeJobPostings")
    @CircuitBreaker(name = "jobPostingServiceClient", fallbackMethod = "getActiveJobPostingsFallback")
    @Retry(name = "jobPostingServiceClient")
    public Flux<JobPostingDTO> getActiveJobPostings() {
        log.debug("Fetching all active job postings");

        return webClient
                .get()
                .uri("/api/job-postings/active")
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new IntegrationException(
                                        "Error when calling Job Posting Service: " +
                                                response.statusCode() + " - " + body))
                )
                .bodyToFlux(JobPostingDTO.class)
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getJobPostingService().getTimeoutSeconds() * 2))
                .doOnComplete(() -> log.debug("Successfully retrieved active job postings"))
                .doOnError(error -> log.error("Error retrieving active job postings: {}", error.getMessage()));
    }

    @CircuitBreaker(name = "jobPostingServiceClient", fallbackMethod = "searchJobPostingsFallback")
    @Retry(name = "jobPostingServiceClient")
    public Flux<JobPostingDTO> searchJobPostings(Map<String, String> searchParams) {
        log.debug("Searching job postings with params: {}", searchParams);

        return webClient
                .get()
                .uri(uriBuilder -> {
                    searchParams.forEach(uriBuilder::queryParam);
                    return uriBuilder.path("/api/job-postings/search").build();
                })
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new IntegrationException(
                                        "Error when calling Job Posting Service: " +
                                                response.statusCode() + " - " + body))
                )
                .bodyToFlux(JobPostingDTO.class)
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getJobPostingService().getTimeoutSeconds()))
                .doOnComplete(() -> log.debug("Successfully searched job postings"))
                .doOnError(error -> log.error("Error searching job postings: {}", error.getMessage()));
    }

    // Fallback methods for resilience
    private Mono<JobPostingDTO> getJobPostingFallback(Long jobPostingId, Exception ex) {
        log.warn("Fallback for job posting retrieval. ID: {}, Error: {}", jobPostingId, ex.getMessage());

        // Return minimal job posting info
        return Mono.just(JobPostingDTO.builder()
                .id(jobPostingId)
                .title("Job Posting #" + jobPostingId + " (unavailable)")
                .description("Details are currently unavailable.")
                .build());
    }

    private Flux<JobPostingDTO> getActiveJobPostingsFallback(Exception ex) {
        log.warn("Fallback for active job postings retrieval. Error: {}", ex.getMessage());
        return Flux.empty();
    }

    private Flux<JobPostingDTO> searchJobPostingsFallback(Map<String, String> searchParams, Exception ex) {
        log.warn("Fallback for job postings search. Params: {}, Error: {}", searchParams, ex.getMessage());
        return Flux.empty();
    }
}