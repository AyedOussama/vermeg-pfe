package com.PFE2025.user_service.service;

import com.PFE2025.user_service.dto.request.RhAdminCreateRequest;
import com.PFE2025.user_service.dto.request.RhAdminUpdateRequest;
import com.PFE2025.user_service.dto.response.RhAdminProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service pour la gestion des profils RH Admin.
 * Gère toutes les opérations CRUD et la logique métier spécifique aux RH Admins.
 */
public interface RhAdminService {

    /**
     * Crée un nouveau RH Admin avec son profil complet.
     * Processus : 1) Créer compte Keycloak, 2) Créer profil RH Admin
     * 
     * @param request Les données de création du RH Admin
     * @return Le profil RH Admin créé
     */
    RhAdminProfileResponse createRhAdmin(RhAdminCreateRequest request);

    /**
     * Met à jour un profil RH Admin par keycloakId
     *
     * @param keycloakId keycloakId du profil à mettre à jour
     * @param request Nouvelles données
     * @return Profil RH Admin mis à jour
     */
    RhAdminProfileResponse updateRhAdminByKeycloakId(String keycloakId, RhAdminCreateRequest request);

    /**
     * Supprime un profil RH Admin par keycloakId
     *
     * @param keycloakId keycloakId du profil à supprimer
     */
    void deleteRhAdminByKeycloakId(String keycloakId);

    /**
     * Récupère un profil RH Admin par son keycloakId
     * 
     * @param keycloakId L'ID Keycloak du RH Admin
     * @return Le profil RH Admin
     */
    RhAdminProfileResponse getRhAdminByKeycloakId(String keycloakId);

    /**
     * Met à jour un profil RH Admin
     * 
     * @param id L'ID du profil à mettre à jour
     * @param request Les nouvelles données
     * @return Le profil RH Admin mis à jour
     */
    RhAdminProfileResponse updateRhAdmin(String id, RhAdminUpdateRequest request);

    /**
     * Supprime un profil RH Admin
     * 
     * @param id L'ID du profil à supprimer
     */
    void deleteRhAdmin(String id);

    /**
     * Liste tous les profils RH Admin avec pagination
     * 
     * @param pageable Les paramètres de pagination
     * @return La page de profils RH Admin
     */
    Page<RhAdminProfileResponse> getAllRhAdmins(Pageable pageable);

    /**
     * Recherche des profils RH Admin par mot-clé
     * 
     * @param keyword Le mot-clé de recherche
     * @param pageable Les paramètres de pagination
     * @return La page de profils RH Admin correspondants
     */
    Page<RhAdminProfileResponse> searchRhAdmins(String keyword, Pageable pageable);

    /**
     * Filtre les profils RH Admin par département
     * 
     * @param department Le département
     * @param pageable Les paramètres de pagination
     * @return La page de profils RH Admin du département
     */
    Page<RhAdminProfileResponse> getRhAdminsByDepartment(String department, Pageable pageable);

    /**
     * Filtre les profils RH Admin par niveau d'accès
     * 
     * @param accessLevel Le niveau d'accès
     * @param pageable Les paramètres de pagination
     * @return La page de profils RH Admin du niveau spécifié
     */
    Page<RhAdminProfileResponse> getRhAdminsByAccessLevel(String accessLevel, Pageable pageable);

    /**
     * Filtre les profils RH Admin par localisation
     * 
     * @param location La localisation
     * @param pageable Les paramètres de pagination
     * @return La page de profils RH Admin de la localisation
     */
    Page<RhAdminProfileResponse> getRhAdminsByLocation(String location, Pageable pageable);

    /**
     * Filtre les profils RH Admin par spécialisation
     * 
     * @param specialization La spécialisation RH
     * @param pageable Les paramètres de pagination
     * @return La page de profils RH Admin avec la spécialisation
     */
    Page<RhAdminProfileResponse> getRhAdminsBySpecialization(String specialization, Pageable pageable);

    /**
     * Filtre les profils RH Admin par expérience minimale en recrutement
     * 
     * @param minExperience L'expérience minimale en années
     * @param pageable Les paramètres de pagination
     * @return La page de profils RH Admin avec l'expérience requise
     */
    Page<RhAdminProfileResponse> getRhAdminsByMinRecruitmentExperience(Integer minExperience, Pageable pageable);

    /**
     * Compte le nombre total de RH Admins
     * 
     * @return Le nombre total de RH Admins
     */
    long countRhAdmins();

    /**
     * Compte le nombre de RH Admins par département
     * 
     * @param department Le département
     * @return Le nombre de RH Admins dans le département
     */
    long countRhAdminsByDepartment(String department);

    /**
     * Vérifie si un profil RH Admin existe pour un keycloakId
     * 
     * @param keycloakId L'ID Keycloak
     * @return true si le profil existe, false sinon
     */
    boolean existsByKeycloakId(String keycloakId);
}
