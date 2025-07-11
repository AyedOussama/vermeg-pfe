package com.PFE2025.user_service.dto.request;

import com.PFE2025.user_service.model.ProjectLeaderProfile;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO pour la création d'un Project Leader avec son profil complet.
 * Contient les données de base utilisateur + les champs spécifiques Project Leader.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requête de création d'un Project Leader")
public class ProjectLeaderCreateRequest {

    // === DONNÉES DE BASE UTILISATEUR ===
    
    @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")
    @Schema(description = "Nom d'utilisateur (sera généré depuis l'email si absent)", example = "john.doe")
    private String username;

    @NotBlank(message = "Le prénom est requis")
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    @Schema(description = "Prénom", example = "John")
    private String firstName;

    @NotBlank(message = "Le nom de famille est requis")
    @Size(max = 100, message = "Le nom de famille ne peut pas dépasser 100 caractères")
    @Schema(description = "Nom de famille", example = "Doe")
    private String lastName;

    @NotBlank(message = "L'email est requis")
    @Email(message = "Format d'email invalide")
    @Schema(description = "Adresse email", example = "john.doe@vermeg.com")
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
    @Schema(description = "Localisation/Ville", example = "Paris, France")
    private String location;

    @Builder.Default
    @Schema(description = "État initial du compte", example = "true")
    private Boolean enabled = true;

    @Builder.Default
    @Schema(description = "Email vérifié", example = "true")
    private Boolean emailVerified = true;

    // === CHAMPS SPÉCIFIQUES PROJECT LEADER ===

    @NotBlank(message = "Le département est requis")
    @Size(max = 100, message = "Le département ne peut pas dépasser 100 caractères")
    @Schema(description = "Département", example = "IT Development")
    private String department;

    @Min(value = 1, message = "La taille de l'équipe doit être d'au moins 1")
    @Max(value = 1000, message = "La taille de l'équipe ne peut pas dépasser 1000")
    @Schema(description = "Nombre de personnes dans l'équipe", example = "8")
    private Integer teamSize;

    @Schema(description = "Liste des projets gérés", example = "[\"Projet Alpha\", \"Projet Beta\"]")
    private List<String> projectsManaged;

    @Schema(description = "Spécialisations techniques", example = "[\"Java\", \"Spring Boot\", \"Microservices\"]")
    private List<String> specializations;

    @Schema(description = "Niveau de management", example = "SENIOR")
    private ProjectLeaderProfile.ManagementLevel managementLevel;

    @Min(value = 0, message = "L'expérience ne peut pas être négative")
    @Max(value = 50, message = "L'expérience ne peut pas dépasser 50 ans")
    @Schema(description = "Années d'expérience", example = "10")
    private Integer yearsOfExperience;

    @Schema(description = "Certifications professionnelles", example = "[\"PMP\", \"Scrum Master\", \"AWS Certified\"]")
    private List<String> certifications;

    @DecimalMin(value = "0.0", message = "Le budget ne peut pas être négatif")
    @Schema(description = "Montant du budget géré (en euros)", example = "500000.0")
    private Double budgetResponsibility;

    @Min(value = 0, message = "Le nombre de projets actuels ne peut pas être négatif")
    @Schema(description = "Nombre de projets actuels", example = "3")
    private Integer currentProjects;

    @Min(value = 0, message = "Le nombre de projets terminés ne peut pas être négatif")
    @Schema(description = "Nombre de projets terminés", example = "15")
    private Integer completedProjects;
}
