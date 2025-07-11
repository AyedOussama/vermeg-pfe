package com.pfe2025.jobpostingservice.model;



import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Entité représentant une entrée dans le journal d'activité d'une offre d'emploi.
 */
@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(exclude = "jobPost")

public class ActivityLog extends BaseEntity implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;

    @Column(name = "user_id", nullable = false)
    @NotNull
    @Size(min = 1, max = 255)
    private String userId;

    @Column(name = "user_name")
    @Size(max = 255)
    private String userName;

    @Column(nullable = false)
    @NotNull
    @Size(min = 1, max = 50)
    private String action;

    @Column(columnDefinition = "TEXT")
    @Size(max = 1000)
    private String details;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime timestamp;

    /**
     * Méthode utilitaire pour créer une entrée de journal pour une création
     */
    public static ActivityLog createCreationLog(JobPost jobPost, String userId, String userName) {
        return ActivityLog.builder()
                .jobPost(jobPost)
                .userId(userId)
                .userName(userName)
                .action("CREATED")
                .details("Offre d'emploi créée")
                .build();
    }

    /**
     * Méthode utilitaire pour créer une entrée de journal pour une mise à jour
     */
    public static ActivityLog createUpdateLog(JobPost jobPost, String userId, String userName, String details) {
        return ActivityLog.builder()
                .jobPost(jobPost)
                .userId(userId)
                .userName(userName)
                .action("UPDATED")
                .details(details)
                .build();
    }

    /**
     * Méthode utilitaire pour créer une entrée de journal pour un changement de statut
     */
    public static ActivityLog createStatusChangeLog(JobPost jobPost, String userId, String userName,
                                                    String oldStatus, String newStatus) {
        return ActivityLog.builder()
                .jobPost(jobPost)
                .userId(userId)
                .userName(userName)
                .action("STATUS_CHANGED")
                .details("Statut changé de " + oldStatus + " à " + newStatus)
                .build();
    }

    /**
     * Méthode utilitaire pour créer une entrée de journal pour une publication
     */
    public static ActivityLog createPublishLog(JobPost jobPost, String userId, String userName) {
        return ActivityLog.builder()
                .jobPost(jobPost)
                .userId(userId)
                .userName(userName)
                .action("PUBLISHED")
                .details("Offre d'emploi publiée")
                .build();
    }

    /**
     * Méthode utilitaire pour créer une entrée de journal pour une clôture
     */
    public static ActivityLog createCloseLog(JobPost jobPost, String userId, String userName, String reason) {
        return ActivityLog.builder()
                .jobPost(jobPost)
                .userId(userId)
                .userName(userName)
                .action("CLOSED")
                .details("Offre d'emploi clôturée: " + reason)
                .build();
    }
}
