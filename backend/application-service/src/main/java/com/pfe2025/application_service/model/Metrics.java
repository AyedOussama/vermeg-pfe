package com.pfe2025.application_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

/**
 * Entité représentant les métriques du système.
 */
@Entity
@Table(name = "metrics")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Metrics extends BaseEntity {

    @Column(name = "metrics_date", nullable = false)
    private LocalDate metricsDate;

    @Column(name = "total_applications")
    private Integer totalApplications;

    @Column(name = "new_applications")
    private Integer newApplications;

    @Column(name = "reviewed_applications")
    private Integer reviewedApplications;

    @Column(name = "shortlisted_applications")
    private Integer shortlistedApplications;

    @Column(name = "rejected_applications")
    private Integer rejectedApplications;

    @Column(name = "auto_accepted_applications")
    private Integer autoAcceptedApplications;

    @Column(name = "auto_rejected_applications")
    private Integer autoRejectedApplications;

    @Column(name = "department")
    private String department;

    @Column(name = "average_processing_time_minutes")
    private Double averageProcessingTimeMinutes;

    @Column(name = "average_evaluation_score")
    private Double averageEvaluationScore;
}