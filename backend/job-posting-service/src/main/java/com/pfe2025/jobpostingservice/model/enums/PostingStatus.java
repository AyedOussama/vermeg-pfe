package com.pfe2025.jobpostingservice.model.enums;



/**
 * Énumération des différents statuts possibles pour une offre d'emploi.
 */
public enum PostingStatus {
    /**
     * État initial lors de la création
     */
    DRAFT,

    /**
     * En cours de révision
     */
    REVIEW,

    /**
     * Publiée et visible par les candidats
     */
    PUBLISHED,

    /**
     * Date d'expiration dépassée
     */
    EXPIRED,

    /**
     * Fermée manuellement (poste pourvu ou annulé)
     */
    CLOSED,

    /**
     * Archivée (non visible dans les recherches standard)
     */
    ARCHIVED
}
