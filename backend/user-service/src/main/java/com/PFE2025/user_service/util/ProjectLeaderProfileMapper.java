package com.PFE2025.user_service.util;

import com.PFE2025.user_service.dto.request.ProjectLeaderCreateRequest;
import com.PFE2025.user_service.dto.request.ProjectLeaderUpdateRequest;
import com.PFE2025.user_service.dto.request.UserCreateRequest;
import com.PFE2025.user_service.dto.response.AuthServiceUserDTO;
import com.PFE2025.user_service.dto.response.ProjectLeaderProfileResponse;
import com.PFE2025.user_service.model.ProjectLeaderProfile;
import org.mapstruct.*;

import java.util.Set;

/**
 * Mapper pour les conversions entre les entités ProjectLeaderProfile et leurs DTOs.
 * Utilise MapStruct pour la génération automatique des méthodes de mapping.
 */
@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface ProjectLeaderProfileMapper {

    // === MAPPING VERS ENTITÉ ===

    /**
     * Convertit une requête de création en entité ProjectLeaderProfile
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "keycloakId", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "userType", constant = "INTERNAL")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "fullName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProjectLeaderProfile fromCreateRequest(ProjectLeaderCreateRequest request);

    /**
     * Met à jour une entité ProjectLeaderProfile existante avec les données de la requête
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "keycloakId", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "userType", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "fullName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(ProjectLeaderUpdateRequest request, @MappingTarget ProjectLeaderProfile profile);

    // === MAPPING VERS DTO DE RÉPONSE ===

    /**
     * Convertit une entité ProjectLeaderProfile en DTO de réponse
     */
    @Mapping(target = "enriched", expression = "java(profile.isEnriched())")
    @Mapping(target = "experienceScore", ignore = true)
    @Mapping(target = "responsibilityLevel", ignore = true)
    ProjectLeaderProfileResponse toResponse(ProjectLeaderProfile profile);

    /**
     * Enrichit un DTO de réponse avec les données d'authentification
     */
    @Mapping(target = "roles", source = "authUser.roles")
    @Mapping(target = "status", expression = "java(authUser.isEnabled() ? \"ACTIVE\" : \"INACTIVE\")")
    @Mapping(target = "firstName", source = "authUser.firstName")
    @Mapping(target = "lastName", source = "authUser.lastName")
    @Mapping(target = "email", source = "authUser.email")
    @Mapping(target = "fullName", source = "authUser.fullName")
    ProjectLeaderProfileResponse enrichWithAuthData(ProjectLeaderProfile profile, AuthServiceUserDTO authUser);

    // === MAPPING VERS USERCREATEREQUEST ===

    /**
     * Convertit une requête de création ProjectLeader en UserCreateRequest pour l'auth-service
     */
    @Mapping(target = "roles", expression = "java(java.util.Set.of(\"PROJECT_LEADER\"))")
    @Mapping(target = "userType", constant = "INTERNAL")
    @Mapping(target = "department", source = "department")
    UserCreateRequest toUserCreateRequest(ProjectLeaderCreateRequest request);

    // === MÉTHODES UTILITAIRES ===

    /**
     * Convertit un Set<String> en List<String>
     */
    default java.util.List<String> setToList(Set<String> set) {
        return set != null ? new java.util.ArrayList<>(set) : null;
    }

    /**
     * Convertit un List<String> en Set<String>
     */
    default Set<String> listToSet(java.util.List<String> list) {
        return list != null ? new java.util.HashSet<>(list) : null;
    }

    /**
     * Post-traitement pour calculer les champs dérivés
     */
    @AfterMapping
    default void calculateDerivedFields(@MappingTarget ProjectLeaderProfileResponse response) {
        if (response != null) {
            response.calculateExperienceScore();
            response.calculateResponsibilityLevel();
            
            // Mettre à jour le fullName si nécessaire
            if (response.getFullName() == null && 
                response.getFirstName() != null && 
                response.getLastName() != null) {
                response.setFullName(response.getFirstName() + " " + response.getLastName());
            }
        }
    }

    /**
     * Post-traitement pour mettre à jour le fullName dans l'entité
     */
    @AfterMapping
    default void updateFullName(@MappingTarget ProjectLeaderProfile profile) {
        if (profile != null) {
            profile.updateFullName();
        }
    }
}
