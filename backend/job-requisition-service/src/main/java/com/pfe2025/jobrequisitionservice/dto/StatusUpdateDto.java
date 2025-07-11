package com.pfe2025.jobrequisitionservice.dto;

import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les mises à jour de statut des réquisitions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateDto {

    @NotNull(message = "Le nouveau statut est obligatoire")
    @Schema(description = "Nouveau statut à appliquer à la réquisition")
    private RequisitionStatus newStatus;

    @Size(max = 1000, message = "Les commentaires ne peuvent pas dépasser 1000 caractères")
    @Schema(description = "Commentaires expliquant la mise à jour de statut", example = "Création de l'offre d'emploi complétée")
    private String comments;
}