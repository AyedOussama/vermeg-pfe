package com.PFE2025.user_service.service;

import com.PFE2025.user_service.dto.event.CvParsedEventDto;

/**
 * Service pour l'enrichissement des profils candidats avec les données IA.
 * Consomme les événements CV_PARSED depuis ai-processing-service.
 */
public interface CvDataEnrichmentService {
    
    /**
     * Enrichit un profil candidat avec les données extraites par l'IA.
     * 
     * @param cvParsedEvent L'événement contenant les données analysées par l'IA
     */
    void enrichCandidateProfile(CvParsedEventDto cvParsedEvent);
}
