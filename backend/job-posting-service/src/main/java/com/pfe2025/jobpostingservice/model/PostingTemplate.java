package com.pfe2025.jobpostingservice.model;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Entité représentant un modèle pour la création d'offres d'emploi.
 */
@Entity
@Table(name = "posting_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder

public class PostingTemplate extends BaseEntity implements Serializable {

    @Column(nullable = false, unique = true)
    @NotNull
    @Size(min = 3, max = 100)
    private String name;

    @Column
    @Size(max = 500)
    private String description;

    @Column
    @Size(max = 100)
    private String department;

    /**
     * Structure JSON définissant les sections et le format du modèle
     */
    @Column(columnDefinition = "JSONB")
    private String structure;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    @NotNull
    @Size(min = 1, max = 255)
    private String createdBy;

    @Column(name = "last_modified_at")
    @UpdateTimestamp
    private LocalDateTime lastModifiedAt;

    @Version
    private Integer version;
}
