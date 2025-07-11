package com.pfe2025.application_service.integration;

import com.pfe2025.application_service.config.ApplicationProperties;
import com.pfe2025.application_service.dto.DocumentDTO;
import com.pfe2025.application_service.exception.IntegrationException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@Component
@Slf4j
public class DocumentServiceClient {

    private final WebClient webClient;
    private final ApplicationProperties applicationProperties;

    public DocumentServiceClient(@Qualifier("documentServiceWebClientBuilder") WebClient.Builder webClientBuilder,
                                 ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
        this.webClient = webClientBuilder
                .baseUrl(applicationProperties.getIntegration().getDocumentService().getBaseUrl())
                .build();

        log.info("DocumentServiceClient initialized with baseUrl: {}",
                applicationProperties.getIntegration().getDocumentService().getBaseUrl());
    }

    @Cacheable(value = "documents", key = "#documentId", unless = "#result == null")
    @CircuitBreaker(name = "documentServiceClient", fallbackMethod = "getDocumentFallback")
    @Retry(name = "documentServiceClient")
    public Mono<DocumentDTO> getDocument(Long documentId) {
        if (documentId == null) {
            return Mono.error(new IllegalArgumentException("Document ID cannot be null"));
        }

        log.debug("Fetching document with ID: {}", documentId);

        return webClient
                .get()
                .uri("/documents/{id}", documentId)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), response -> {
                    if (response.statusCode() == HttpStatus.NOT_FOUND) {
                        return Mono.error(new IntegrationException("Document not found with ID: " + documentId));
                    }
                    return response.bodyToMono(String.class)
                            .map(body -> new IntegrationException(
                                    "Client error when calling Document Service: " +
                                            response.statusCode() + " - " + body));
                })
                .onStatus(status -> status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new IntegrationException(
                                        "Server error when calling Document Service: " +
                                                response.statusCode() + " - " + body))
                )
                .bodyToMono(Map.class)
                .map(response -> {
                    // Extract document from ApiResponse wrapper
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) response.get("data");
                    // Convert to DocumentDTO
                    return convertToDocumentDTO(data);
                })
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getDocumentService().getTimeoutSeconds()))
                .doOnSuccess(doc -> log.debug("Successfully retrieved document: {}", documentId))
                .doOnError(error -> log.error("Error retrieving document: {}", documentId, error))
                .onErrorMap(WebClientResponseException.class, ex -> {
                    if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                        return new IntegrationException("Document not found with ID: " + documentId);
                    }
                    return new IntegrationException("Error calling Document Service: " + ex.getMessage(), ex);
                })
                .onErrorMap(ex -> !(ex instanceof IntegrationException),
                        ex -> new IntegrationException("Unexpected error calling Document Service", ex));
    }

    @CircuitBreaker(name = "documentServiceClient", fallbackMethod = "uploadDocumentFallback")
    @Retry(name = "documentServiceClient")
    public Mono<Long> uploadDocument(String candidateId, FilePart filePart, String documentType) {
        if (candidateId == null || candidateId.trim().isEmpty()) {
            return Mono.error(new IllegalArgumentException("Candidate ID cannot be null or empty"));
        }
        if (filePart == null) {
            return Mono.error(new IllegalArgumentException("File part cannot be null"));
        }

        log.debug("Uploading document of type {} for candidate {}", documentType, candidateId);

        // Construct a proper multipart request as expected by the controller
        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("file", filePart);

        // This should match the DocumentDto.UploadRequest structure
        Map<String, String> request = Map.of(
                "candidateId", candidateId,
                "documentType", documentType
        );
        bodyBuilder.part("request", request);

        return webClient
                .post()
                .uri("/documents/upload")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(bodyBuilder.build()))
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new IntegrationException(
                                        "Error when calling Document Service: " +
                                                response.statusCode() + " - " + body))
                )
                .bodyToMono(Map.class)
                .map(response -> {
                    // Extract document ID from response
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) response.get("data");
                    return Long.valueOf(data.get("id").toString());
                })
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getDocumentService().getTimeoutSeconds() * 2))
                .doOnSuccess(docId -> log.debug("Successfully uploaded document with ID: {}", docId))
                .doOnError(error -> log.error("Error uploading document: {}", error.getMessage(), error))
                .onErrorMap(ex -> new IntegrationException("Error uploading document", ex));
    }

    // Remaining methods and fallbacks...

    // Helper method to convert Map to DocumentDTO
    private DocumentDTO convertToDocumentDTO(Map<String, Object> data) {
        DocumentDTO dto = new DocumentDTO();
        // Set properties from data map
        if (data.containsKey("id")) {
            dto.setId(Long.valueOf(data.get("id").toString()));
        }
        if (data.containsKey("fileName")) {
            dto.setFilename(data.get("fileName").toString());
        }
        // Add other properties as needed
        return dto;
    }

    // Fallback methods for resilience
    private Mono<DocumentDTO> getDocumentFallback(Long documentId, Exception ex) {
        log.warn("Fallback for document retrieval. ID: {}, Error: {}", documentId, ex.getMessage());
        return Mono.empty();
    }

    private Mono<Long> uploadDocumentFallback(String candidateId, FilePart filePart, String documentType, Exception ex) {
        log.error("Fallback for document upload. Cannot upload document for candidate {}: {}",
                candidateId, ex.getMessage());
        return Mono.error(new IntegrationException("Failed to upload document. Please try again later.", ex));
    }
}