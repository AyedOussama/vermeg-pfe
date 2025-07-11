package com.pfe2025.jobrequisitionservice.model;

/**
 * Énumération des différents statuts possibles pour une réquisition.
 */
public enum RequisitionStatus {
    /**
     * État initial lors de la création
     */
    DRAFT,

    /**
     * Soumis pour approbation par le CEO
     */
    SUBMITTED,

    /**
     * Approuvé par le CEO
     */
    APPROVED,

    /**
     * Rejeté par le CEO
     */
    REJECTED,

    /**
     * Annulé par le Chef de Projet
     */
    CANCELLED,

    /**
     * Offre d'emploi créée, recrutement en cours
     */
    IN_PROGRESS,

    /**
     * Tous les postes pourvus
     */
    FULFILLED,

    /**
     * Fermé pour toute raison (annulé ou pourvu)
     */
    CLOSED
}