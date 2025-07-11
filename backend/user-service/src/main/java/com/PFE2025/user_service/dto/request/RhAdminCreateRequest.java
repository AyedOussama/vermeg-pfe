package com.PFE2025.user_service.dto.request;

import com.PFE2025.user_service.model.RhAdminProfile;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO pour la création d'un RH Admin avec son profil complet.
 * Contient les données de base utilisateur + les champs spécifiques RH Admin.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requête de création d'un RH Admin")
public class RhAdminCreateRequest {

    // === DONNÉES DE BASE UTILISATEUR ===
    
    @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")
    @Schema(description = "Nom d'utilisateur (sera généré depuis l'email si absent)", example = "marie.martin")
    private String username;

    @NotBlank(message = "Le prénom est requis")
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    @Schema(description = "Prénom", example = "Marie")
    private String firstName;

    @NotBlank(message = "Le nom de famille est requis")
    @Size(max = 100, message = "Le nom de famille ne peut pas dépasser 100 caractères")
    @Schema(description = "Nom de famille", example = "Martin")
    private String lastName;

    @NotBlank(message = "L'email est requis")
    @Email(message = "Format d'email invalide")
    @Schema(description = "Adresse email", example = "marie.martin@vermeg.com")
    private String email;

    @NotBlank(message = "Le mot de passe est requis")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!*]).*$", 
             message = "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial")
    @Schema(description = "Mot de passe", example = "SecurePass123!")
    private String password;

    @Pattern(regexp = "^\\+?[0-9\\s()-]{8,20}$", message = "Format de téléphone invalide")
    @Schema(description = "Numéro de téléphone", example = "+33123456789")
    private String phone;

    @Size(max = 100, message = "La localisation ne peut pas dépasser 100 caractères")
    @Schema(description = "Localisation/Ville", example = "Lyon, France")
    private String location;

    @Builder.Default
    @Schema(description = "État initial du compte", example = "true")
    private Boolean enabled = true;

    @Builder.Default
    @Schema(description = "Email vérifié", example = "true")
    private Boolean emailVerified = true;

    // === CHAMPS SPÉCIFIQUES RH ADMIN ===

    @NotBlank(message = "Le département est requis")
    @Size(max = 100, message = "Le département ne peut pas dépasser 100 caractères")
    @Schema(description = "Département RH", example = "Human Resources")
    private String department;

    @Schema(description = "Spécialisations RH", example = "[\"Recrutement\", \"Formation\", \"Gestion des talents\"]")
    private List<String> hrSpecializations;

    @Min(value = 0, message = "L'expérience en recrutement ne peut pas être négative")
    @Max(value = 50, message = "L'expérience en recrutement ne peut pas dépasser 50 ans")
    @Schema(description = "Années d'expérience en recrutement", example = "8")
    private Integer recruitmentExperience;

    @Schema(description = "Entreprises précédentes", example = "[\"Accenture\", \"Capgemini\", \"Sopra Steria\"]")
    private List<String> companiesWorked;

    @Schema(description = "Certifications RH", example = "[\"SHRM-CP\", \"PHR\", \"CIPD\"]")
    private List<String> certifications;

    @Schema(description = "Langues parlées", example = "[\"Français\", \"Anglais\", \"Espagnol\"]")
    private List<String> languages;

    @Schema(description = "Niveau d'accès", example = "NATIONAL")
    private RhAdminProfile.AccessLevel accessLevel;

    @Schema(description = "Départements sous responsabilité", example = "[\"IT\", \"Marketing\", \"Sales\"]")
    private List<String> responsibleFor;

    @Min(value = 0, message = "Le nombre d'employés gérés ne peut pas être négatif")
    @Schema(description = "Nombre d'employés gérés", example = "150")
    private Integer employeesManaged;

    @Min(value = 0, message = "L'objectif de recrutement ne peut pas être négatif")
    @Schema(description = "Objectif de recrutement annuel", example = "50")
    private Integer recruitmentQuota;
}
