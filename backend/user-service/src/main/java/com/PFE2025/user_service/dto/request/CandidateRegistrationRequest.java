package com.PFE2025.user_service.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * DTO pour l'auto-inscription d'un candidat avec profil complet.
 * Contient toutes les informations requises pour créer un compte candidat et son profil.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Demande d'enregistrement d'un candidat avec profil complet")
public class CandidateRegistrationRequest {

    // === DONNÉES DE BASE POUR KEYCLOAK ===

    @Schema(description = "Nom d'utilisateur (optionnel, sera généré depuis l'email si absent)")
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

    @Schema(description = "Numéro de téléphone", required = true)
    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^\\+?[0-9\\s()-]{8,20}$", message = "Format de téléphone invalide")
    private String phone;

    // === NOUVELLES DONNÉES PERSONNELLES ÉTENDUES ===

    @Schema(description = "Localisation/Ville", required = true)
    @NotBlank(message = "La localisation est obligatoire")
    @Size(max = 200, message = "La localisation ne peut pas dépasser 200 caractères")
    private String location;

    @Schema(description = "URL du profil LinkedIn")
    @Pattern(regexp = "^(https?://)?(www\\.)?linkedin\\.com/in/[a-zA-Z0-9-]+/?$",
             message = "Format d'URL LinkedIn invalide")
    private String linkedinUrl;

    @Schema(description = "URL du portfolio personnel")
    @Pattern(regexp = "^(https?://)?[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/.*)?$",
             message = "Format d'URL de portfolio invalide")
    private String portfolioUrl;

    @Schema(description = "Date de naissance (format: YYYY-MM-DD)", required = true)
    @NotBlank(message = "La date de naissance est obligatoire")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$",
             message = "Format de date invalide. Utilisez YYYY-MM-DD")
    private String dateOfBirth;

    @Schema(description = "Catégories professionnelles préférées", required = true)
    @NotEmpty(message = "Au moins une catégorie préférée est obligatoire")
    @Size(max = 10, message = "Maximum 10 catégories autorisées")
    private List<String> preferredCategories;

    @Schema(description = "Fichier CV à uploader", required = true)
    @NotNull(message = "Le fichier CV est obligatoire")
    private MultipartFile cvFile;

    // === CHAMPS SYSTÈME ===

    @Builder.Default
    private Set<String> roles = new HashSet<>();

}