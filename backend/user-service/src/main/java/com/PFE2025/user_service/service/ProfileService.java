package com.PFE2025.user_service.service;

import com.PFE2025.user_service.dto.response.CandidateProfileResponse;
import com.PFE2025.user_service.dto.response.UserDTO;

/**
 * Service pour la gestion des profils utilisateurs.
 * Gère les profils candidats complets et les profils utilisateurs basiques.
 */
public interface ProfileService {
    
    /**
     * Récupère le profil complet de l'utilisateur connecté.
     * - Pour les CANDIDATS : retourne le profil complet avec toutes les données IA
     * - Pour les autres utilisateurs : retourne le profil basique
     * 
     * @return Le profil de l'utilisateur (CandidateProfileResponse ou UserDTO selon le type)
     */
    Object getCurrentUserProfile();
    
    /**
     * Récupère le profil candidat complet par keycloakId.
     * Utilisé uniquement pour les candidats.
     * 
     * @param keycloakId L'ID Keycloak du candidat
     * @return Le profil candidat complet
     */
    CandidateProfileResponse getCandidateProfile(String keycloakId);
    
    /**
     * Met à jour la photo de profil d'un candidat.
     * 
     * @param keycloakId L'ID Keycloak du candidat
     * @param photoUrl L'URL de la nouvelle photo
     * @return Le profil candidat mis à jour
     */
    CandidateProfileResponse updateCandidatePhoto(String keycloakId, String photoUrl);
}
