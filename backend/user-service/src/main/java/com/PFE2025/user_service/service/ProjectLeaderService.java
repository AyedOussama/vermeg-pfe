package com.PFE2025.user_service.service;

import com.PFE2025.user_service.dto.request.ProjectLeaderCreateRequest;
import com.PFE2025.user_service.dto.request.ProjectLeaderUpdateRequest;
import com.PFE2025.user_service.dto.response.ProjectLeaderProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service pour la gestion des profils Project Leader.
 * Gère toutes les opérations CRUD et la logique métier spécifique aux Project Leaders.
 */
public interface ProjectLeaderService {

    /**
     * Crée un nouveau Project Leader avec son profil complet.
     * Processus : 1) Créer compte Keycloak, 2) Créer profil Project Leader
     * 
     * @param request Les données de création du Project Leader
     * @return Le profil Project Leader créé
     */
    ProjectLeaderProfileResponse createProjectLeader(ProjectLeaderCreateRequest request);

    /**
     * Récupère un profil Project Leader par son ID
     * 
     * @param id L'ID du profil Project Leader
     * @return Le profil Project Leader
     */
    ProjectLeaderProfileResponse getProjectLeaderById(String id);

    /**
     * Récupère un profil Project Leader par son keycloakId
     * 
     * @param keycloakId L'ID Keycloak du Project Leader
     * @return Le profil Project Leader
     */
    ProjectLeaderProfileResponse getProjectLeaderByKeycloakId(String keycloakId);

    /**
     * Met à jour un profil Project Leader
     * 
     * @param id L'ID du profil à mettre à jour
     * @param request Les nouvelles données
     * @return Le profil Project Leader mis à jour
     */
    ProjectLeaderProfileResponse updateProjectLeader(String id, ProjectLeaderUpdateRequest request);

    /**
     * Supprime un profil Project Leader
     *
     * @param id L'ID du profil à supprimer
     */
    void deleteProjectLeader(String id);

    /**
     * Met à jour un profil Project Leader par keycloakId
     *
     * @param keycloakId keycloakId du profil à mettre à jour
     * @param request Nouvelles données
     * @return Profil Project Leader mis à jour
     */
    ProjectLeaderProfileResponse updateProjectLeaderByKeycloakId(String keycloakId, ProjectLeaderCreateRequest request);

    /**
     * Supprime un profil Project Leader par keycloakId
     *
     * @param keycloakId keycloakId du profil à supprimer
     */
    void deleteProjectLeaderByKeycloakId(String keycloakId);

    /**
     * Liste tous les profils Project Leader avec pagination
     * 
     * @param pageable Les paramètres de pagination
     * @return La page de profils Project Leader
     */
    Page<ProjectLeaderProfileResponse> getAllProjectLeaders(Pageable pageable);

    /**
     * Recherche des profils Project Leader par mot-clé
     * 
     * @param keyword Le mot-clé de recherche
     * @param pageable Les paramètres de pagination
     * @return La page de profils Project Leader correspondants
     */
    Page<ProjectLeaderProfileResponse> searchProjectLeaders(String keyword, Pageable pageable);

    /**
     * Filtre les profils Project Leader par département
     * 
     * @param department Le département
     * @param pageable Les paramètres de pagination
     * @return La page de profils Project Leader du département
     */
    Page<ProjectLeaderProfileResponse> getProjectLeadersByDepartment(String department, Pageable pageable);

    /**
     * Filtre les profils Project Leader par niveau de management
     * 
     * @param managementLevel Le niveau de management
     * @param pageable Les paramètres de pagination
     * @return La page de profils Project Leader du niveau spécifié
     */
    Page<ProjectLeaderProfileResponse> getProjectLeadersByManagementLevel(String managementLevel, Pageable pageable);

    /**
     * Filtre les profils Project Leader par localisation
     * 
     * @param location La localisation
     * @param pageable Les paramètres de pagination
     * @return La page de profils Project Leader de la localisation
     */
    Page<ProjectLeaderProfileResponse> getProjectLeadersByLocation(String location, Pageable pageable);

    /**
     * Filtre les profils Project Leader par expérience minimale
     * 
     * @param minExperience L'expérience minimale en années
     * @param pageable Les paramètres de pagination
     * @return La page de profils Project Leader avec l'expérience requise
     */
    Page<ProjectLeaderProfileResponse> getProjectLeadersByMinExperience(Integer minExperience, Pageable pageable);

    /**
     * Compte le nombre total de Project Leaders
     * 
     * @return Le nombre total de Project Leaders
     */
    long countProjectLeaders();

    /**
     * Compte le nombre de Project Leaders par département
     * 
     * @param department Le département
     * @return Le nombre de Project Leaders dans le département
     */
    long countProjectLeadersByDepartment(String department);

    /**
     * Vérifie si un profil Project Leader existe pour un keycloakId
     * 
     * @param keycloakId L'ID Keycloak
     * @return true si le profil existe, false sinon
     */
    boolean existsByKeycloakId(String keycloakId);
}
