package com.pfe2025.jobpostingservice.model;


import com.pfe2025.jobpostingservice.model.enums.EmploymentType;
import com.pfe2025.jobpostingservice.model.enums.PostingStatus;
import com.pfe2025.jobpostingservice.model.enums.PublicationLevel;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité principale représentant une offre d'emploi.
 */
@Entity
@Table(name = "job_postings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(exclude = {"skills", "metrics", "activityLog"})

public class JobPost extends BaseEntity implements Serializable {

    @Column(nullable = false)
    @NotNull
    @Size(min = 5, max = 255)
    private String title;

    @Column(nullable = true)
    private Long requisitionId;

    @Column(nullable = false)
    @NotNull
    @Size(min = 1, max = 100)
    private String department;

    @Column
    @Size(max = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private EmploymentType employmentType;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotNull
    @Size(min = 10, max = 10000)
    private String description;

    @Column(columnDefinition = "TEXT")
    @Size(max = 5000)
    private String responsibilities;

    @Column(columnDefinition = "TEXT")
    @Size(max = 5000)
    private String qualifications;

    @Column(columnDefinition = "TEXT")
    @Size(max = 5000)
    private String benefits;

    @Column(name = "min_experience")
    @Min(0)
    private Integer minExperience;

    @Column(name = "salary_range_min", precision = 12, scale = 2)
    private BigDecimal salaryRangeMin;

    @Column(name = "salary_range_max", precision = 12, scale = 2)
    private BigDecimal salaryRangeMax;

    @Column(name = "display_salary")
    private Boolean displaySalary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private PostingStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "publication_level")
    private PublicationLevel publicationLevel;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "created_by", nullable = false)
    @NotNull
    @Size(min = 1, max = 255)
    private String createdBy;

    @Column(name = "last_modified_by")
    @Size(max = 255)
    private String lastModifiedBy;

    @Column(name = "last_modified_at")
    @UpdateTimestamp
    private LocalDateTime lastModifiedAt;

    @Column(name = "template_id")
    private Long templateId;

    @Version
    private Integer version;

    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<JobPostingSkill> skills = new HashSet<>();

    @OneToOne(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PostingMetrics metrics;

    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ActivityLog> activityLog = new HashSet<>();

    /**
     * Ajoute une compétence à l'offre d'emploi.
     *
     * @param skill La compétence à ajouter
     * @return L'offre d'emploi mise à jour (pour le chaînage)
     */
    public JobPost addSkill(JobPostingSkill skill) {
        skills.add(skill);
        skill.setJobPost(this);
        return this;
    }

    /**
     * Supprime une compétence de l'offre d'emploi.
     *
     * @param skill La compétence à supprimer
     * @return L'offre d'emploi mise à jour (pour le chaînage)
     */
    public JobPost removeSkill(JobPostingSkill skill) {
        skills.remove(skill);
        skill.setJobPost(null);
        return this;
    }

    /**
     * Ajoute une entrée dans le journal d'activité.
     *
     * @param log L'entrée de journal à ajouter
     * @return L'offre d'emploi mise à jour (pour le chaînage)
     */
    public JobPost addActivityLog(ActivityLog log) {
        activityLog.add(log);
        log.setJobPost(this);
        return this;
    }

    /**
     * Initialise les métriques pour cette offre d'emploi.
     *
     * @return L'offre d'emploi mise à jour (pour le chaînage)
     */
    public JobPost initializeMetrics() {
        if (this.metrics == null) {
            PostingMetrics newMetrics = PostingMetrics.builder()
                    .jobPost(this)
                    .totalViewCount(0)
                    .uniqueViewCount(0)
                    .totalApplicationCount(0)
                    .conversionRate(0.0)
                    .lastUpdated(LocalDateTime.now())
                    .build();
            this.metrics = newMetrics;
        }
        return this;
    }
}
