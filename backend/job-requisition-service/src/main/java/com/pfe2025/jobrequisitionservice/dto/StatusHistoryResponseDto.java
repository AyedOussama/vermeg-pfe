package com.pfe2025.jobrequisitionservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour représenter l'historique des changements de statut d'une réquisition de poste.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistoryResponseDto {

    @Schema(description = "Statut précédent de la réquisition", example = "DRAFT")
    private RequisitionStatus oldStatus;

    @Schema(description = "Nouveau statut de la réquisition", example = "SUBMITTED")
    private RequisitionStatus newStatus;

    @Schema(description = "Nom de l'utilisateur ayant effectué le changement", example = "Jean Dupont")
    private String changedByName;

    @Schema(description = "Commentaires associés au changement de statut",
            example = "Soumission pour approbation suite à la réunion du 15/03")
    private String comments;

    @Schema(description = "Date et heure du changement de statut")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime changedAt;
}