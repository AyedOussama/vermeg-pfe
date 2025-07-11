package com.pfe2025.jobrequisitionservice.event;

import com.pfe2025.jobrequisitionservice.dto.JobRequisitionSummaryDTO;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * Événement émis lorsque le statut d'une réquisition change.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RequisitionStatusChangedEvent extends BaseEvent {

    /**
     * Ancien statut
     */
    private RequisitionStatus oldStatus;

    /**
     * Nouveau statut
     */
    private RequisitionStatus newStatus;

    /**
     * Nom de l'utilisateur ayant effectué le changement
     */
    private String changedByName;

    /**
     * Commentaires associés au changement
     */
    private String comments;

    /**
     * Résumé de la réquisition concernée
     */
    private JobRequisitionSummaryDTO requisitionSummary;
}