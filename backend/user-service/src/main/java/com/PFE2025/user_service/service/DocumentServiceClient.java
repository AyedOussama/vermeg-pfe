package com.PFE2025.user_service.service;

import com.PFE2025.user_service.dto.response.DocumentUploadResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;

/**
 * Client pour appeler le document-management-service via WebClient.
 * Gère l'upload de documents CV pour les candidats.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentServiceClient {
    
    @Qualifier("documentServiceWebClient")
    private final WebClient documentServiceWebClient;
    
    /**
     * Upload un fichier CV vers le document-management-service.
     * 
     * @param cvFile Le fichier CV à uploader
     * @param keycloakId L'ID Keycloak du candidat
     * @return Un Mono contenant l'ID du document uploadé
     */
    public Mono<Long> uploadCV(MultipartFile cvFile, String keycloakId) {
        log.info("🔄 DÉBUT UPLOAD CV - keycloakId: {}, fileName: {}, size: {} bytes",
                keycloakId, cvFile.getOriginalFilename(), cvFile.getSize());

        try {
            // Construire le body multipart (seulement le fichier)
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", cvFile.getResource())
                   .filename(cvFile.getOriginalFilename())
                   .contentType(MediaType.parseMediaType(cvFile.getContentType()));

            return documentServiceWebClient
                    .post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/upload")
                            .queryParam("keycloakId", keycloakId)
                            .queryParam("documentType", "CV")
                            .build())
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), clientResponse -> {
                        log.error("❌ ERREUR CLIENT - Upload CV échoué pour keycloakId: {} - Status: {}", 
                                keycloakId, clientResponse.statusCode());
                        return clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(new RuntimeException(
                                        "Client error uploading CV: " + clientResponse.statusCode() + " - " + errorBody)));
                    })
                    .onStatus(status -> status.is5xxServerError(), clientResponse -> {
                        log.error("❌ ERREUR SERVEUR - Upload CV échoué pour keycloakId: {} - Status: {}", 
                                keycloakId, clientResponse.statusCode());
                        return clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(new RuntimeException(
                                        "Server error uploading CV: " + clientResponse.statusCode() + " - " + errorBody)));
                    })
                    .bodyToMono(DocumentUploadResponse.class)
                    .map(response -> {
                        log.info("✅ UPLOAD CV RÉUSSI - keycloakId: {}, documentId: {}, fileName: {}", 
                                keycloakId, response.getDocumentId(), response.getFileName());
                        return response.getDocumentId();
                    })
                    .doOnError(error -> {
                        log.error("❌ ERREUR UPLOAD CV - keycloakId: {} - {}", keycloakId, error.getMessage(), error);
                    });
                    
        } catch (Exception e) {
            log.error("❌ ERREUR PRÉPARATION UPLOAD - keycloakId: {} - {}", keycloakId, e.getMessage(), e);
            return Mono.error(new RuntimeException("Failed to prepare CV upload for keycloakId: " + keycloakId, e));
        }
    }
    
    /**
     * Vérifie si un document existe par son ID.
     *
     * @param documentId L'ID du document à vérifier
     * @return Un Mono<Boolean> indiquant si le document existe
     */
    public Mono<Boolean> documentExists(Long documentId) {
        log.debug("Vérification existence document ID: {}", documentId);

        return documentServiceWebClient
                .get()
                .uri("/{documentId}", documentId)
                .retrieve()
                .onStatus(status -> status.equals(org.springframework.http.HttpStatus.NOT_FOUND),
                         clientResponse -> Mono.error(new RuntimeException("Document not found")))
                .bodyToMono(String.class)
                .map(response -> true)
                .onErrorReturn(false);
    }
}
