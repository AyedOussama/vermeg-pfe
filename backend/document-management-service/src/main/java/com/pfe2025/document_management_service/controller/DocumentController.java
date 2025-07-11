package com.pfe2025.document_management_service.controller;

import com.pfe2025.document_management_service.dto.DocumentDto;
import com.pfe2025.document_management_service.dto.DocumentDeleteResponse;
import com.pfe2025.document_management_service.dto.DocumentUploadResponse;
import com.pfe2025.document_management_service.model.Document;
import com.pfe2025.document_management_service.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Documents", description = "API pour la gestion des documents")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload un document - Retourne l'ID du document")
    public Mono<ResponseEntity<DocumentUploadResponse>> uploadDocument(
            @RequestPart("file") Mono<FilePart> filePartMono,
            @RequestParam("keycloakId") String keycloakId,     // Retour à @RequestParam
            @RequestParam("documentType") String documentType) {  // @RequestParam en String

        log.info("Upload request: keycloakId={}, type={}", keycloakId, documentType);

        // Convertir le String en enum
        Document.DocumentType type;
        try {
            type = Document.DocumentType.valueOf(documentType.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Mono.just(ResponseEntity.badRequest()
                    .body(DocumentUploadResponse.builder()
                            .message("Type de document invalide: " + documentType +
                                    ". Types acceptés: CV, COVER_LETTER, CERTIFICATE, DIPLOMA, PROFILE_PHOTO, OTHER")
                            .build()));
        }

        return filePartMono
                .flatMap(file -> documentService.uploadDocument(file, keycloakId, type))
                .map(ResponseEntity::ok)
                .onErrorResume(e -> {
                    log.error("Upload error: ", e);
                    return Mono.just(ResponseEntity.badRequest()
                            .body(DocumentUploadResponse.builder()
                                    .message("Erreur: " + e.getMessage())
                                    .build()));
                });
    }

    // Routes spécifiques d'abord (pour éviter les conflits de mapping)
    @GetMapping("/user/{keycloakId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lister tous les documents d'un utilisateur")
    public Flux<DocumentDto> getUserDocuments(@PathVariable String keycloakId) {
        return documentService.getDocumentsByUser(keycloakId);
    }

    @GetMapping("/user/{keycloakId}/profile-photo")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtenir la photo de profil active")
    public Mono<ResponseEntity<DocumentDto>> getActiveProfilePhoto(@PathVariable String keycloakId) {
        return documentService.getActiveProfilePhoto(keycloakId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // Routes génériques ensuite
    @GetMapping("/{documentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Récupérer les métadonnées d'un document par son ID")
    public Mono<ResponseEntity<DocumentDto>> getDocument(@PathVariable Long documentId) {
        return documentService.getDocument(documentId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/{documentId}/preview")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Prévisualiser un document (affiche dans le navigateur)")
    public Mono<Void> previewDocument(
            @PathVariable Long documentId,
            ServerHttpResponse response) {

        log.info("Preview request for document ID: {}", documentId);

        return documentService.getDocument(documentId)
                .flatMap(doc -> {
                    response.getHeaders().setContentType(MediaType.parseMediaType(doc.getContentType()));
                    response.getHeaders().add("Content-Disposition",
                            "inline; filename=\"" + doc.getOriginalFileName() + "\"");

                    if (doc.getFileSize() != null) {
                        response.getHeaders().setContentLength(doc.getFileSize());
                    }

                    response.getHeaders().add("Cache-Control", "max-age=3600");

                    return response.writeWith(documentService.downloadDocument(documentId));
                });
    }

    @GetMapping("/{documentId}/download")
    @Operation(summary = "Télécharger un document (force le téléchargement)")
    public Mono<Void> downloadDocument(
            @PathVariable Long documentId,
            ServerHttpResponse response) {

        log.info("Download request for document ID: {}", documentId);

        return documentService.getDocument(documentId)
                .flatMap(doc -> {
                    response.getHeaders().setContentType(MediaType.parseMediaType(doc.getContentType()));
                    response.getHeaders().add("Content-Disposition",
                            "attachment; filename=\"" + doc.getOriginalFileName() + "\"");

                    if (doc.getFileSize() != null) {
                        response.getHeaders().setContentLength(doc.getFileSize());
                    }

                    return response.writeWith(documentService.downloadDocument(documentId));
                });
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Supprimer un document")
    public Mono<ResponseEntity<DocumentDeleteResponse>> deleteDocument(@PathVariable Long documentId) {
        return documentService.deleteDocument(documentId)
                .map(response -> ResponseEntity.ok(response))
                .onErrorResume(e -> {
                    log.error("Delete error: ", e);
                    return Mono.just(ResponseEntity.badRequest()
                            .body(DocumentDeleteResponse.builder()
                                    .message("Erreur lors de la suppression: " + e.getMessage())
                                    .documentId(documentId)
                                    .success(false)
                                    .build()));
                });
    }
}