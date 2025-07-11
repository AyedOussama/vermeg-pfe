package com.pfe2025.jobrequisitionservice.dto;

import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO pour une version résumée d'une réquisition de poste.
 * Utilisé pour les listes et recherches.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequisitionSummaryDTO {

    @Schema(description = "Identifiant unique de la réquisition")
    private Long id;

    @Schema(description = "Titre du poste")
    private String title;

    @Schema(description = "Département concerné")
    private String department;

    @Schema(description = "Niveau d'expérience requis")
    private String requiredLevel;

    @Schema(description = "Date de début prévue")
    private LocalDate expectedStartDate;

    @Schema(description = "Indique si le besoin est urgent")
    private Boolean urgent;

    @Schema(description = "Nombre de postes à pourvoir")
    private Integer neededHeadcount;

    @Schema(description = "Statut actuel de la réquisition")
    private RequisitionStatus status;

    @Schema(description = "Date de création de la réquisition")
    private LocalDateTime createdAt;
}