package com.PFE2025.user_service.util;

import com.PFE2025.user_service.dto.request.RhAdminCreateRequest;
import com.PFE2025.user_service.dto.request.RhAdminUpdateRequest;
import com.PFE2025.user_service.dto.request.UserCreateRequest;
import com.PFE2025.user_service.dto.response.AuthServiceUserDTO;
import com.PFE2025.user_service.dto.response.RhAdminProfileResponse;
import com.PFE2025.user_service.model.RhAdminProfile;
import org.mapstruct.*;

import java.util.Set;

/**
 * Mapper pour les conversions entre les entités RhAdminProfile et leurs DTOs.
 * Utilise MapStruct pour la génération automatique des méthodes de mapping.
 */
@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface RhAdminProfileMapper {

    // === MAPPING VERS ENTITÉ ===

    /**
     * Convertit une requête de création en entité RhAdminProfile
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "keycloakId", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "userType", constant = "INTERNAL")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "fullName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    RhAdminProfile fromCreateRequest(RhAdminCreateRequest request);

    /**
     * Met à jour une entité RhAdminProfile existante avec les données de la requête
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "keycloakId", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "userType", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "fullName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(RhAdminUpdateRequest request, @MappingTarget RhAdminProfile profile);

    // === MAPPING VERS DTO DE RÉPONSE ===

    /**
     * Convertit une entité RhAdminProfile en DTO de réponse
     */
    @Mapping(target = "enriched", expression = "java(profile.isEnriched())")
    @Mapping(target = "experienceScore", ignore = true)
    @Mapping(target = "expertiseLevel", ignore = true)
    @Mapping(target = "responsibilityScope", ignore = true)
    RhAdminProfileResponse toResponse(RhAdminProfile profile);

    /**
     * Enrichit un DTO de réponse avec les données d'authentification
     */
    @Mapping(target = "roles", source = "authUser.roles")
    @Mapping(target = "status", expression = "java(authUser.isEnabled() ? \"ACTIVE\" : \"INACTIVE\")")
    @Mapping(target = "firstName", source = "authUser.firstName")
    @Mapping(target = "lastName", source = "authUser.lastName")
    @Mapping(target = "email", source = "authUser.email")
    @Mapping(target = "fullName", source = "authUser.fullName")
    RhAdminProfileResponse enrichWithAuthData(RhAdminProfile profile, AuthServiceUserDTO authUser);

    // === MAPPING VERS USERCREATEREQUEST ===

    /**
     * Convertit une requête de création RhAdmin en UserCreateRequest pour l'auth-service
     */
    @Mapping(target = "roles", expression = "java(java.util.Set.of(\"RH_ADMIN\"))")
    @Mapping(target = "userType", constant = "INTERNAL")
    @Mapping(target = "department", source = "department")
    UserCreateRequest toUserCreateRequest(RhAdminCreateRequest request);

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
    default void calculateDerivedFields(@MappingTarget RhAdminProfileResponse response) {
        if (response != null) {
            response.calculateExperienceScore();
            response.calculateExpertiseLevel();
            response.calculateResponsibilityScope();
            
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
    default void updateFullName(@MappingTarget RhAdminProfile profile) {
        if (profile != null) {
            profile.updateFullName();
        }
    }
}
