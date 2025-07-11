package com.pfe2025.application_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entité représentant les rapports générés.
 */
@Entity
@Table(name = "reports")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Report extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "report_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ReportType reportType;

    @Column(name = "parameters", columnDefinition = "TEXT")
    private String parameters; // Stocké comme JSON

    @Column(name = "result_data", columnDefinition = "TEXT")
    private String resultData; // Stocké comme JSON

    @Column(name = "format")
    @Enumerated(EnumType.STRING)
    private ReportFormat format;

    @Column(name = "generated_file_path")
    private String generatedFilePath;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "job_posting_id")
    private Long jobPostingId;

    @Column(name = "department")
    private String department;







    @Column(name = "is_scheduled")
    private Boolean isScheduled;

    @Column(name = "schedule_cron")
    private String scheduleCron;

    @Column(name = "last_generated_at")
    private LocalDateTime lastGeneratedAt;

    @Column(name = "generation_status")
    @Enumerated(EnumType.STRING)
    private GenerationStatus generationStatus;

    @Column(name = "error_message")
    private String errorMessage;

    public enum ReportType {
        JOB_POSTING_ANALYTICS,     // Analyse d'une offre spécifique
        EVALUATION_ACCURACY        // Précision des évaluations IA
    }

    public enum ReportFormat {
        JSON,   // Format JSON brut
        PDF,    // Document PDF formaté
        CSV,    // Fichier CSV pour données
        EXCEL   // Fichier Excel avec tableaux et graphiques
    }

    public enum GenerationStatus {
        PENDING,    // En attente de génération
        PROCESSING, // Génération en cours
        COMPLETED,  // Génération terminée avec succès
        FAILED      // Échec de génération
    }
}