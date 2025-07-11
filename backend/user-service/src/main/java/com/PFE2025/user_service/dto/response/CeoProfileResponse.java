package com.PFE2025.user_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de réponse pour les profils CEO.
 * Contient toutes les informations du CEO sans champ département.
 * Les données de base (firstName, lastName, email) viennent de Keycloak via /auth/me.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Profil complet d'un CEO")
public class CeoProfileResponse {

    // === IDENTIFIANTS ===
    
    @Schema(description = "ID unique du profil", example = "507f1f77bcf86cd799439011")
    private String id;

    @Schema(description = "ID Keycloak de l'utilisateur", example = "123e4567-e89b-12d3-a456-426614174000")
    private String keycloakId;

    // === DONNÉES DE BASE ===
    
    @Schema(description = "Prénom", example = "Jean")
    private String firstName;

    @Schema(description = "Nom de famille", example = "Dupont")
    private String lastName;

    @Schema(description = "Nom complet (prénom + nom)", example = "Jean Dupont")
    private String fullName;

    @Schema(description = "Adresse email", example = "jean.dupont@vermeg.com")
    private String email;

    @Schema(description = "Rôles utilisateur", example = "[\"CEO\"]")
    private List<String> roles;

    @Schema(description = "Type d'utilisateur", example = "INTERNAL")
    private String userType;

    @Schema(description = "Statut du compte", example = "ACTIVE")
    private String status;

    @Schema(description = "Localisation/Ville", example = "Paris, France")
    private String location;

    @Schema(description = "Numéro de téléphone", example = "+33123456789")
    private String phone;

    // === CHAMPS SPÉCIFIQUES CEO ===
    // NOTE: Pas de département - le CEO supervise toute l'organisation
    // Profil simplifié - seuls les champs de base sont conservés

    // === MÉTADONNÉES ===

    @Schema(description = "Date de création du profil")
    private LocalDateTime createdAt;

    @Schema(description = "Date de dernière mise à jour")
    private LocalDateTime updatedAt;



    /**
     * Met à jour automatiquement le fullName à partir du firstName et lastName
     */
    public void updateFullName() {
        if (firstName != null && lastName != null) {
            this.fullName = firstName + " " + lastName;
        }
    }
}
