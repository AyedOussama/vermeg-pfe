package com.pfe2025.application_service.integration;

import com.pfe2025.application_service.config.ApplicationProperties;
import com.pfe2025.application_service.dto.CandidateProfileDTO;
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
public class CandidateServiceClient {

    private final WebClient webClient;
    private final ApplicationProperties applicationProperties;

    public CandidateServiceClient(@Qualifier("internalServiceWebClientBuilder") WebClient.Builder webClientBuilder,
                                  ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
        this.webClient = webClientBuilder
                .baseUrl(applicationProperties.getIntegration().getCandidateService().getBaseUrl())
                .build();

        log.info("CandidateServiceClient initialized with baseUrl: {}",
                applicationProperties.getIntegration().getCandidateService().getBaseUrl());
    }

    @Cacheable(value = "candidateProfiles", key = "#keycloakId", unless = "#result == null")
    @CircuitBreaker(name = "candidateServiceClient", fallbackMethod = "getProfileFallback")
    @Retry(name = "candidateServiceClient")
    public Mono<CandidateProfileDTO> getCandidateProfile(String keycloakId) {
        if (keycloakId == null || keycloakId.trim().isEmpty()) {
            return Mono.error(new IllegalArgumentException("Keycloak ID cannot be null or empty"));
        }

        log.debug("Fetching candidate profile for keycloakId: {}", keycloakId);

        return webClient
                .get()
                .uri("/api/candidates/{keycloakId}", keycloakId)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), response -> {
                    if (response.statusCode() == HttpStatus.NOT_FOUND) {
                        return Mono.error(new IntegrationException("Candidate profile not found for ID: " + keycloakId));
                    }
                    return response.bodyToMono(String.class)
                            .map(body -> new IntegrationException(
                                    "Client error when calling Candidate Service: " +
                                            response.statusCode() + " - " + body));
                })
                .onStatus(status -> status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new IntegrationException(
                                        "Server error when calling Candidate Service: " +
                                                response.statusCode() + " - " + body))
                )
                .bodyToMono(CandidateProfileDTO.class)
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getCandidateService().getTimeoutSeconds()))
                .doOnSuccess(profile -> log.debug("Successfully retrieved profile for candidate: {}", keycloakId))
                .doOnError(error -> log.error("Error retrieving profile for candidate: {}", keycloakId, error))
                .onErrorMap(WebClientResponseException.class, ex -> {
                    if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                        return new IntegrationException("Candidate profile not found for ID: " + keycloakId);
                    }
                    return new IntegrationException("Error calling Candidate Service: " + ex.getMessage(), ex);
                })
                .onErrorMap(ex -> !(ex instanceof IntegrationException),
                        ex -> new IntegrationException("Unexpected error calling Candidate Service", ex));
    }

    @CircuitBreaker(name = "candidateServiceClient", fallbackMethod = "searchCandidatesFallback")
    @Retry(name = "candidateServiceClient")
    public Flux<CandidateProfileDTO> searchCandidates(Map<String, String> searchParams) {
        log.debug("Searching candidates with params: {}", searchParams);

        return webClient
                .get()
                .uri(uriBuilder -> {
                    searchParams.forEach(uriBuilder::queryParam);
                    return uriBuilder.path("/api/candidates/search").build();
                })
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new IntegrationException(
                                        "Error when calling Candidate Service: " +
                                                response.statusCode() + " - " + body))
                )
                .bodyToFlux(CandidateProfileDTO.class)
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getCandidateService().getTimeoutSeconds()))
                .doOnComplete(() -> log.debug("Successfully searched candidates"))
                .doOnError(error -> log.error("Error searching candidates: {}", error.getMessage()));
    }

    // Fallback methods
    public Mono<CandidateProfileDTO> getProfileFallback(String keycloakId, Exception ex) {
        log.warn("Fallback for candidate profile retrieval. ID: {}, Error: {}", keycloakId, ex.getMessage());
        return Mono.empty();
    }

    public Flux<CandidateProfileDTO> searchCandidatesFallback(Map<String, String> searchParams, Exception ex) {
        log.warn("Fallback for candidates search. Params: {}, Error: {}", searchParams, ex.getMessage());
        return Flux.empty();
    }
}