package com.pfe2025.document_management_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Table("documents")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    private Long id;

    @Column("keycloak_id")
    private String keycloakId;

    @Column("document_type")
    private DocumentType documentType;

    @Column("file_name")
    private String fileName;

    @Column("original_file_name")
    private String originalFileName;

    @Column("file_path")
    private String filePath;

    @Column("content_type")
    private String contentType;

    @Column("file_size")
    private Long fileSize;

    @Column("is_active")
    @Builder.Default
    private boolean isActive = true;

    @CreatedDate
    @Column("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private LocalDateTime updatedAt;

    public enum DocumentType {
        CV,
        COVER_LETTER,
        CERTIFICATE,
        DIPLOMA,
        PROFILE_PHOTO,
        OTHER
    }
}