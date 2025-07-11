package com.pfe2025.jobpostingservice.model;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Entité représentant un fragment de contenu réutilisable.
 */
@Entity
@Table(name = "content_fragments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder

public class ContentFragment extends BaseEntity implements Serializable {

    @Column(name = "fragment_key", nullable = false, unique = true)
    @NotNull
    @Size(min = 3, max = 100)
    private String fragmentKey;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotNull
    @Size(min = 1, max = 5000)
    private String content;

    @Column(nullable = false)
    @NotNull
    @Size(min = 1, max = 50)
    private String type;

    @Column
    @Size(max = 10)
    private String language;

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

    @Column(name = "last_modified_by")
    @Size(max = 255)
    private String lastModifiedBy;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
