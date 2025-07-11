package com.PFE2025.user_service.util;

import com.PFE2025.user_service.dto.request.CeoUpdateRequest;
import com.PFE2025.user_service.dto.response.CeoProfileResponse;
import com.PFE2025.user_service.model.CeoProfile;
import org.mapstruct.*;

/**
 * Mapper MapStruct pour les profils CEO.
 * Gère la conversion entre les entités et les DTOs avec enrichissement automatique.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CeoProfileMapper {

    /**
     * Convertit une entité CeoProfile en CeoProfileResponse
     */
    CeoProfileResponse toResponse(CeoProfile profile);



    /**
     * Met à jour une entité CeoProfile existante avec les données d'un CeoUpdateRequest
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "keycloakId", ignore = true)
    @Mapping(target = "firstName", ignore = true)
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "fullName", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "userType", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget CeoProfile profile, CeoUpdateRequest request);

    /**
     * Post-traitement pour enrichir la réponse avec les champs calculés
     */
    @AfterMapping
    default void enrichResponse(@MappingTarget CeoProfileResponse response) {
        // Calculer le fullName si nécessaire
        if (response.getFullName() == null && response.getFirstName() != null && response.getLastName() != null) {
            response.setFullName(response.getFirstName() + " " + response.getLastName());
        }
    }

    /**
     * Post-traitement pour enrichir l'entité avant sauvegarde
     */
    @AfterMapping
    default void enrichEntity(@MappingTarget CeoProfile profile) {
        // Calculer le fullName
        if (profile.getFirstName() != null && profile.getLastName() != null) {
            profile.setFullName(profile.getFirstName() + " " + profile.getLastName());
        }

        // Définir le type d'utilisateur
        profile.setUserType("CEO");

        // Définir le statut par défaut
        if (profile.getStatus() == null) {
            profile.setStatus("ACTIVE");
        }
    }
}
