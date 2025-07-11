package com.pfe2025.document_management_service.service;


import com.pfe2025.document_management_service.dto.DocumentDto;
import com.pfe2025.document_management_service.dto.DocumentDeleteResponse;
import com.pfe2025.document_management_service.dto.DocumentEventDto;
import com.pfe2025.document_management_service.dto.DocumentUploadResponse;
import com.pfe2025.document_management_service.exception.DocumentNotFoundException;
import com.pfe2025.document_management_service.exception.InvalidFileException;
import com.pfe2025.document_management_service.model.Document;
import com.pfe2025.document_management_service.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final MinioService minioService;
    private final StreamBridge streamBridge;
    private final FileSecurityService fileSecurityService;

    @Value("${document.upload.allowed-image-types}")
    private List<String> allowedImageTypes;

    @Value("${document.upload.allowed-document-types}")
    private List<String> allowedDocumentTypes;

    @Value("${document.upload.max-file-size}")
    private long maxFileSize;

    @Value("${document.profile-photo.max-size}")
    private long maxPhotoSize;

    private static final String DOCUMENT_UPLOADED_BINDING = "documentUploaded-out-0";

    /**
     * Upload un document avec validation et gestion optimisée
     */
    @Transactional
    public Mono<DocumentUploadResponse> uploadDocument(FilePart file, String keycloakId, Document.DocumentType type) {
        String contentType = file.headers().getContentType() != null ?
                file.headers().getContentType().toString() : "application/octet-stream";

        log.info("Starting document upload for user: {}, type: {}, file: {}",
                keycloakId, type, file.filename());

        // Validation du nom de fichier et sécurité
        return fileSecurityService.validateFileName(file.filename())
                .then(validateFileType(type, contentType))
                .then(Mono.defer(() -> {
                    // Si c'est une photo de profil, désactiver les anciennes
                    if (type == Document.DocumentType.PROFILE_PHOTO) {
                        return documentRepository.deactivateOldProfilePhotos(keycloakId)
                                .doOnSuccess(v -> log.debug("Old profile photos deactivated for user: {}", keycloakId))
                                .then(performUpload(file, keycloakId, type, contentType));
                    }
                    return performUpload(file, keycloakId, type, contentType);
                }))
                .doOnSuccess(response -> log.info("Document uploaded successfully: {}", response.getDocumentId()))
                .doOnError(e -> log.error("Upload failed for user {}: {}", keycloakId, e.getMessage()));
    }

    /**
     * Effectue l'upload du fichier avec toutes les étapes
     */
    private Mono<DocumentUploadResponse> performUpload(FilePart file, String keycloakId,
                                                       Document.DocumentType type, String contentType) {
        String folder = buildFolderPath(keycloakId, type);

        return minioService.uploadFile(file, folder)
                .flatMap(filePath -> {
                    // Créer l'entité Document
                    Document document = Document.builder()
                            .keycloakId(keycloakId)
                            .documentType(type)
                            .fileName(extractFileName(filePath))
                            .originalFileName(file.filename())
                            .filePath(filePath)
                            .contentType(contentType)
                            .isActive(true)
                            .build();

                    log.debug("Saving document metadata: {}", document.getFileName());
                    return documentRepository.save(document);
                })
                .flatMap(savedDoc -> {
                    // Obtenir et vérifier la taille du fichier
                    return minioService.getFileSize(savedDoc.getFilePath())
                            .flatMap(size -> {
                                // Vérifier la taille après upload
                                long maxSize = (savedDoc.getDocumentType() == Document.DocumentType.PROFILE_PHOTO)
                                        ? maxPhotoSize : maxFileSize;

                                if (size > maxSize) {
                                    log.warn("File too large: {} bytes (max: {} bytes)", size, maxSize);
                                    // Nettoyer si le fichier est trop gros
                                    return cleanupFailedUpload(savedDoc)
                                            .then(Mono.error(new InvalidFileException(
                                                    String.format("Fichier trop volumineux. Taille max: %d MB",
                                                            maxSize / 1024 / 1024))));
                                }

                                savedDoc.setFileSize(size);
                                return documentRepository.save(savedDoc);
                            })
                            .onErrorResume(e -> {
                                log.warn("Could not verify file size, continuing: {}", e.getMessage());
                                return Mono.just(savedDoc);
                            });
                })
                .flatMap(finalDoc -> {
                    // Publier l'événement si c'est un CV
                    if (type == Document.DocumentType.CV) {
                        publishCvUploadedEvent(finalDoc);
                    }

                    // Construire la réponse
                    return Mono.just(DocumentUploadResponse.builder()
                            .documentId(finalDoc.getId())
                            .message("Document uploadé avec succès")
                            .documentType(finalDoc.getDocumentType().name())
                            .fileName(finalDoc.getOriginalFileName())
                            .fileSize(finalDoc.getFileSize())
                            .uploadedAt(finalDoc.getCreatedAt() != null ?
                                    finalDoc.getCreatedAt() : LocalDateTime.now())
                            .build());
                });
    }

    /**
     * Récupère les métadonnées d'un document
     */
    public Mono<DocumentDto> getDocument(Long id) {
        return documentRepository.findById(id)
                .switchIfEmpty(Mono.error(new DocumentNotFoundException(id)))
                .map(this::mapToDto);
    }

    /**
     * Stream le contenu d'un document
     */
    public Flux<DataBuffer> downloadDocument(Long documentId) {
        return documentRepository.findById(documentId)
                .switchIfEmpty(Mono.error(new DocumentNotFoundException(documentId)))
                .flatMapMany(doc -> {
                    log.debug("Downloading document: {} from path: {}", documentId, doc.getFilePath());
                    return minioService.downloadFile(doc.getFilePath());
                });
    }

    /**
     * Liste tous les documents d'un utilisateur
     */
    public Flux<DocumentDto> getDocumentsByUser(String keycloakId) {
        return documentRepository.findByKeycloakId(keycloakId)
                .map(this::mapToDto);
    }

    /**
     * Récupère la photo de profil active
     */
    public Mono<DocumentDto> getActiveProfilePhoto(String keycloakId) {
        return documentRepository.findActiveByKeycloakIdAndType(keycloakId, "PROFILE_PHOTO")
                .map(this::mapToDto);
    }

    /**
     * Supprime un document avec nettoyage complet
     */
    @Transactional
    public Mono<DocumentDeleteResponse> deleteDocument(Long id) {
        return documentRepository.findById(id)
                .switchIfEmpty(Mono.error(new DocumentNotFoundException(id)))
                .flatMap(doc -> {
                    log.info("Deleting document: {} for user: {}", id, doc.getKeycloakId());

                    // Supprimer d'abord de la base de données
                    return documentRepository.delete(doc)
                            .then(minioService.deleteFile(doc.getFilePath())
                                    .doOnSuccess(v -> log.info("Document {} deleted successfully from MinIO", id))
                                    .onErrorResume(e -> {
                                        log.error("Failed to delete file from MinIO: {}", e.getMessage());
                                        // Continuer même si MinIO échoue
                                        return Mono.empty();
                                    })
                            )
                            .then(Mono.just(DocumentDeleteResponse.builder()
                                    .message("Document deleted successfully")
                                    .documentId(id)
                                    .success(true)
                                    .build()));
                });
    }

    /**
     * Publie un événement pour le traitement AI des CV
     */
    private void publishCvUploadedEvent(Document document) {
        try {
            DocumentEventDto event = DocumentEventDto.builder()
                    .documentId(document.getId())
                    .keycloakId(document.getKeycloakId())
                    .documentType(document.getDocumentType().name())
                    .filePath(document.getFilePath())
                    .contentType(document.getContentType())
                    .timestamp(LocalDateTime.now())
                    .build();

            boolean sent = streamBridge.send(DOCUMENT_UPLOADED_BINDING, event);

            if (sent) {
                log.info("CV uploaded event published for document: {}", document.getId());
            } else {
                log.error("Failed to publish CV uploaded event for document: {}", document.getId());
            }
        } catch (Exception e) {
            log.error("Error publishing CV event for document {}: {}", document.getId(), e.getMessage());
        }
    }

    /**
     * Valide uniquement le type de fichier
     */
    private Mono<Void> validateFileType(Document.DocumentType type, String contentType) {
        if (type == Document.DocumentType.PROFILE_PHOTO) {
            if (!allowedImageTypes.contains(contentType)) {
                return Mono.error(new InvalidFileException(
                        "Type d'image non autorisé. Types acceptés: " + String.join(", ", allowedImageTypes)));
            }
        } else {
            if (!allowedDocumentTypes.contains(contentType) && !allowedImageTypes.contains(contentType)) {
                return Mono.error(new InvalidFileException(
                        "Type de fichier non autorisé. Types acceptés: " +
                                String.join(", ", allowedDocumentTypes) + ", " +
                                String.join(", ", allowedImageTypes)));
            }
        }
        return Mono.empty();
    }

    /**
     * Nettoie un upload échoué
     */
    private Mono<Void> cleanupFailedUpload(Document document) {
        log.debug("Cleaning up failed upload for document: {}", document.getId());

        return documentRepository.delete(document)
                .then(minioService.deleteFile(document.getFilePath()))
                .onErrorResume(e -> {
                    log.error("Error during cleanup: {}", e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Construit le chemin de stockage
     */
    private String buildFolderPath(String keycloakId, Document.DocumentType type) {
        return String.format("candidates/%s/%s", keycloakId, type.name().toLowerCase());
    }

    /**
     * Extrait le nom de fichier du chemin complet
     */
    private String extractFileName(String filePath) {
        return filePath.substring(filePath.lastIndexOf('/') + 1);
    }

    /**
     * Convertit une entité Document en DTO
     */
    private DocumentDto mapToDto(Document document) {
        return DocumentDto.builder()
                .id(document.getId())
                .keycloakId(document.getKeycloakId())
                .documentType(document.getDocumentType().name())
                .fileName(document.getFileName())
                .originalFileName(document.getOriginalFileName())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .isActive(document.isActive())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}