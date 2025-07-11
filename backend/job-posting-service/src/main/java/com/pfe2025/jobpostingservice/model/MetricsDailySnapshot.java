package com.pfe2025.jobpostingservice.model;



import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * Entité représentant un snapshot quotidien des métriques d'une offre d'emploi.
 */
@Entity
@Table(name = "metrics_daily_snapshots",
        uniqueConstraints = @UniqueConstraint(columnNames = {"metrics_id", "date"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(exclude = "metrics")

public class MetricsDailySnapshot extends BaseEntity implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metrics_id", nullable = false)
    private PostingMetrics metrics;

    @Column(nullable = false)
    @NotNull
    private LocalDate date;

    @Column(name = "daily_view_count", nullable = false)
    @Builder.Default
    private Integer dailyViewCount = 0;

    @Column(name = "daily_unique_view_count", nullable = false)
    @Builder.Default
    private Integer dailyUniqueViewCount = 0;

    @Column(name = "daily_application_count", nullable = false)
    @Builder.Default
    private Integer dailyApplicationCount = 0;
}
