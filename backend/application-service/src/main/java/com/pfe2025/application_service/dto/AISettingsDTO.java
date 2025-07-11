package com.pfe2025.application_service.dto;

import com.pfe2025.application_service.model.AISettings.AutomationLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour les paramètres IA.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AISettingsDTO {
    private Long id;

    @NotNull(message = "Le département est obligatoire")
    private String department;

    private String jobType;

    @Min(value = 0, message = "Le seuil d'acceptation doit être positif")
    @Max(value = 100, message = "Le seuil d'acceptation ne doit pas dépasser 100")
    private Double autoAcceptThreshold;

    @Min(value = 0, message = "Le seuil de rejet doit être positif")
    @Max(value = 100, message = "Le seuil de rejet ne doit pas dépasser 100")
    private Double autoRejectThreshold;

    @Min(value = 0, message = "Le seuil de revue doit être positif")
    @Max(value = 100, message = "Le seuil de revue ne doit pas dépasser 100")
    private Double reviewThreshold;

    @NotNull(message = "Le niveau d'automatisation est obligatoire")
    private AutomationLevel automationLevel;

    private Boolean isActive;

    private LocalDateTime lastCalibrationDate;

    private Boolean isSelfCalibrating;
}