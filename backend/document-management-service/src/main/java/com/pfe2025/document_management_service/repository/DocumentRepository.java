package com.pfe2025.document_management_service.repository;

import com.pfe2025.document_management_service.model.Document;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface DocumentRepository extends R2dbcRepository<Document, Long> {

    Flux<Document> findByKeycloakId(String keycloakId);

    Flux<Document> findByKeycloakIdAndDocumentType(String keycloakId, Document.DocumentType type);

    @Query("SELECT * FROM documents WHERE keycloak_id = :keycloakId AND document_type = :type AND is_active = true LIMIT 1")
    Mono<Document> findActiveByKeycloakIdAndType(String keycloakId, String type);

    @Query("UPDATE documents SET is_active = false WHERE keycloak_id = :keycloakId AND document_type = 'PROFILE_PHOTO' AND is_active = true")
    Mono<Void> deactivateOldProfilePhotos(String keycloakId);
}
