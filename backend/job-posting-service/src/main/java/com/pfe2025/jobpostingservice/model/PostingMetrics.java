package com.pfe2025.jobpostingservice.model;



import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité représentant les métriques associées à une offre d'emploi.
 */
@Entity
@Table(name = "posting_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(exclude = {"jobPost", "dailySnapshots"})

public class PostingMetrics extends BaseEntity implements Serializable {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id", nullable = false, unique = true)
    private JobPost jobPost;

    @Column(name = "total_view_count", nullable = false)
    @Builder.Default
    private Integer totalViewCount = 0;

    @Column(name = "unique_view_count", nullable = false)
    @Builder.Default
    private Integer uniqueViewCount = 0;

    @Column(name = "total_application_count", nullable = false)
    @Builder.Default
    private Integer totalApplicationCount = 0;

    @Column(name = "conversion_rate")
    private Double conversionRate;

    @Column(name = "last_updated", nullable = false)
    @UpdateTimestamp
    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "metrics", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<MetricsDailySnapshot> dailySnapshots = new HashSet<>();

    /**
     * Ajoute une vue à cette offre d'emploi.
     *
     * @param isUnique Indique s'il s'agit d'une vue unique
     */
    public void incrementViews(boolean isUnique) {
        this.totalViewCount++;
        if (isUnique) {
            this.uniqueViewCount++;
        }
        recalculateConversionRate();
    }

    /**
     * Incrémente le compteur de candidatures.
     */
    public void incrementApplications() {
        this.totalApplicationCount++;
        recalculateConversionRate();
    }

    /**
     * Recalcule le taux de conversion.
     */
    private void recalculateConversionRate() {
        if (this.uniqueViewCount > 0) {
            this.conversionRate = (double) this.totalApplicationCount / this.uniqueViewCount * 100.0;
        } else {
            this.conversionRate = 0.0;
        }
    }

    /**
     * Ajoute un snapshot quotidien.
     *
     * @param snapshot Le snapshot à ajouter
     * @return Les métriques mises à jour (pour le chaînage)
     */
    public PostingMetrics addDailySnapshot(MetricsDailySnapshot snapshot) {
        this.dailySnapshots.add(snapshot);
        snapshot.setMetrics(this);
        return this;
    }
}
