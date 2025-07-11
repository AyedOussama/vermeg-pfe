package com.PFE2025.user_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO pour la représentation complète d'un utilisateur.
 * Combine les données locales et les données d'authentification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Représentation complète d'un utilisateur")
public class UserDTO {
    // ID local du user-service
    @Schema(description = "ID local de l'utilisateur")
    private String id;

    // ID de Keycloak (Source de vérité)
    @Schema(description = "ID Keycloak de l'utilisateur")
    private String keycloakId;

    // Données venant de Keycloak (via auth-service)
    @Schema(description = "Nom d'utilisateur")
    private String username;

    @Schema(description = "Prénom")
    private String firstName;

    @Schema(description = "Nom de famille")
    private String lastName;

    @Schema(description = "Email")
    private String email;

    @Schema(description = "Rôles de l'utilisateur")
    private Set<String> roles;

    @Schema(description = "Indique si le compte est actif")
    private boolean enabled;

    // Données locales spécifiques
    @Schema(description = "Numéro de téléphone")
    private String phone;

    @Schema(description = "Département/Service")
    private String department;

    @Schema(description = "Type d'utilisateur", allowableValues = {"CANDIDATE", "INTERNAL"})
    private String userType;

    @Schema(description = "Version de l'entité pour la gestion des concurrences")
    private String fullName; // Convenience field combining firstName + lastName
    // Timestamps locaux
    @Schema(description = "Date de création")
    private LocalDateTime createdAt;

    @Schema(description = "Date de dernière modification")
    private LocalDateTime updatedAt;
}