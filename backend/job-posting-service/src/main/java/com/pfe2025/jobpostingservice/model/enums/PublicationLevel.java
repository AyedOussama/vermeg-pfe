package com.pfe2025.jobpostingservice.model.enums;



/**
 * Énumération des différents niveaux de mise en avant des offres d'emploi.
 */
public enum PublicationLevel {
    /**
     * Publication standard
     */
    STANDARD,

    /**
     * Publication mise en avant (spotlight)
     */
    FEATURED,

    /**
     * Publication prioritaire (top)
     */
    PRIORITY,

    /**
     * Publication interne uniquement (non visible sur les portails externes)
     */
    INTERNAL_ONLY
}
