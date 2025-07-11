package com.PFE2025.user_service.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * DTO pour la création d'un utilisateur.
 * Utilisé pour les requêtes de création d'utilisateurs internes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Demande de création d'utilisateur")
public class UserCreateRequest {
    @Schema(description = "Nom d'utilisateur (sera généré depuis l'email si absent)")
    @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")
    private String username;

    @Schema(description = "Prénom", required = true)
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    private String firstName;

    @Schema(description = "Nom de famille", required = true)
    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    private String lastName;

    @Schema(description = "Email", required = true)
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Le format de l'email est invalide")
    private String email;

    @Schema(description = "Mot de passe", required = true)
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!*]).*$",
            message = "Le mot de passe doit contenir au moins un chiffre, une lettre minuscule, une lettre majuscule et un caractère spécial")
    private String password;

    @Schema(description = "Rôles à attribuer à l'utilisateur")
    private Set<String> roles;

    @Schema(description = "Numéro de téléphone")
    @Pattern(regexp = "^\\+?[0-9\\s()-]{8,20}$", message = "Format de téléphone invalide")
    private String phone;

    @Schema(description = "Département/Service")
    @Size(max = 100, message = "Le département ne peut pas dépasser 100 caractères")
    private String department;

    @Schema(description = "État initial du compte", defaultValue = "true")
    private boolean enabled = true;

    @Schema(description = "Email vérifié", defaultValue = "true")
    private boolean emailVerified = true;

    @Schema(description = "Type d'utilisateur", defaultValue = "INTERNAL")
    private String userType = "INTERNAL";
}