package com.PFE2025.user_service.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;

/**
 * DTO pour la mise à jour d'un profil CEO.
 * Contient uniquement les champs modifiables (pas les données Keycloak de base).
 * NOTE: Pas de département car le CEO supervise toute l'organisation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Données pour mettre à jour un profil CEO")
public class CeoUpdateRequest {

    // === DONNÉES DE BASE MODIFIABLES ===
    
    @Pattern(regexp = "^\\+?[0-9\\s()-]{8,20}$", message = "Le numéro de téléphone n'est pas valide")
    @Schema(description = "Numéro de téléphone", example = "+33123456789")
    private String phone;

    @Size(max = 100, message = "La localisation ne peut pas dépasser 100 caractères")
    @Schema(description = "Localisation/Ville", example = "Paris, France")
    private String location;

    // === CHAMPS SPÉCIFIQUES CEO ===
    // NOTE: Pas de département - le CEO supervise toute l'organisation
    // Profil simplifié - seuls les champs de base sont conservés
}
