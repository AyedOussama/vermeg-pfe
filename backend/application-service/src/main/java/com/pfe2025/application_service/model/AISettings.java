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

import java.time.LocalDateTime;

/**
 * Entité représentant les paramètres d'automatisation IA par département/poste.
 */
@Entity
@Table(name = "ai_settings")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AISettings extends BaseEntity {

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "job_type")
    private String jobType;

    // Seuils dynamiques
    @Column(name = "auto_accept_threshold")
    private Double autoAcceptThreshold;

    @Column(name = "auto_reject_threshold")
    private Double autoRejectThreshold;

    @Column(name = "review_threshold")
    private Double reviewThreshold;

    // Niveau d'automatisation
    @Column(name = "automation_level")
    @Enumerated(EnumType.STRING)
    private AutomationLevel automationLevel;

    // Configurations IA (générique)
    @Column(name = "ai_base_configuration", columnDefinition = "TEXT")
    private String aiBaseConfiguration; // JSON

    @Column(name = "last_calibration_date")
    private LocalDateTime lastCalibrationDate;

    @Column(name = "is_self_calibrating")
    private Boolean isSelfCalibrating;

    @Column(name = "is_active")
    private Boolean isActive;

    /**
     * Énumération des niveaux d'automatisation.
     */
    public enum AutomationLevel {
        FULL_AUTO,      // Accepte/rejette automatiquement tout
        HIGH,           // Accepte/rejette la plupart, demande décision pour cas limites
        MEDIUM,         // Accepte/rejette les cas évidents, demande décision pour autres
        LOW,            // Propose seulement des recommandations
        MANUAL          // Aucune automatisation
    }

    /**
     * Détermine si l'automatisation est activée.
     *
     * @return true si l'automatisation est activée
     */
    public boolean isAutomationEnabled() {
        return Boolean.TRUE.equals(this.isActive) &&
                this.automationLevel != null &&
                this.automationLevel != AutomationLevel.MANUAL;
    }

    /**
     * Détermine si l'acceptation automatique est activée.
     *
     * @return true si l'acceptation automatique est activée
     */
    public boolean isAutoAcceptEnabled() {
        return isAutomationEnabled() &&
                this.autoAcceptThreshold != null &&
                (this.automationLevel == AutomationLevel.FULL_AUTO ||
                        this.automationLevel == AutomationLevel.HIGH);
    }

    /**
     * Détermine si le rejet automatique est activé.
     *
     * @return true si le rejet automatique est activé
     */
    public boolean isAutoRejectEnabled() {
        return isAutomationEnabled() &&
                this.autoRejectThreshold != null &&
                (this.automationLevel == AutomationLevel.FULL_AUTO ||
                        this.automationLevel == AutomationLevel.HIGH ||
                        this.automationLevel == AutomationLevel.MEDIUM);
    }
}