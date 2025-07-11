package com.pfe2025.jobpostingservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;

/**
 * Entité représentant une compétence requise pour une offre d'emploi.
 */
@Entity
@Table(name = "job_posting_skills",
        uniqueConstraints = @UniqueConstraint(columnNames = {"job_post_id", "name"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(exclude = "jobPost")

public class JobPostingSkill extends BaseEntity implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;

    @Column(nullable = false)
    @NotNull
    @Size(min = 1, max = 100)
    private String name;

    @Column(name = "is_required")
    @Builder.Default
    private Boolean isRequired = false;

    @Column
    @Size(max = 500)
    private String description;

    @Column
    @Size(max = 50)
    private String level;
}