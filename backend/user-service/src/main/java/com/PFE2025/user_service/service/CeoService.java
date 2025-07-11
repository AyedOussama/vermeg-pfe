package com.PFE2025.user_service.service;

import com.PFE2025.user_service.dto.request.CeoUpdateRequest;
import com.PFE2025.user_service.dto.response.CeoProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Interface de service pour la gestion des profils CEO.
 * Fournit les opérations CRUD et les fonctionnalités de recherche.
 */
public interface CeoService {



    /**
     * Récupère tous les profils CEO avec pagination
     * @param pageable Paramètres de pagination
     * @return Page de profils CEO
     */
    Page<CeoProfileResponse> getAllCeos(Pageable pageable);

    /**
     * Récupère un profil CEO par son ID
     * @param id ID du profil
     * @return Profil CEO
     */
    CeoProfileResponse getCeoById(String id);

    /**
     * Récupère un profil CEO par son keycloakId
     * @param keycloakId ID Keycloak
     * @return Profil CEO
     */
    CeoProfileResponse getCeoByKeycloakId(String keycloakId);

    /**
     * Met à jour un profil CEO par keycloakId
     * @param keycloakId keycloakId du profil à mettre à jour
     * @param request Nouvelles données
     * @return Profil CEO mis à jour
     */
    CeoProfileResponse updateCeoByKeycloakId(String keycloakId, CeoUpdateRequest request);

    /**
     * Supprime un profil CEO par keycloakId
     * @param keycloakId keycloakId du profil à supprimer
     */
    void deleteCeoByKeycloakId(String keycloakId);

    /**
     * Recherche des CEOs par mot-clé
     * @param keyword Mot-clé de recherche
     * @param pageable Paramètres de pagination
     * @return Page de profils CEO correspondants
     */
    Page<CeoProfileResponse> searchCeos(String keyword, Pageable pageable);

    /**
     * Récupère les CEOs par localisation
     * @param location Localisation
     * @param pageable Paramètres de pagination
     * @return Page de profils CEO
     */
    Page<CeoProfileResponse> getCeosByLocation(String location, Pageable pageable);



    /**
     * Compte le nombre total de CEOs
     * @return Nombre de CEOs
     */
    long countCeos();

    /**
     * Vérifie si un profil CEO existe pour un keycloakId donné
     * @param keycloakId ID Keycloak
     * @return true si le profil existe
     */
    boolean existsByKeycloakId(String keycloakId);
}
