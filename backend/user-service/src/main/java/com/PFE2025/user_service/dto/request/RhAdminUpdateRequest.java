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
 * DTO pour la mise à jour d'un profil RH Admin.
 * Tous les champs sont optionnels pour permettre des mises à jour partielles.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requête de mise à jour d'un profil RH Admin")
public class RhAdminUpdateRequest {

    // === DONNÉES DE BASE UTILISATEUR ===
    
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    @Schema(description = "Prénom", example = "Marie")
    private String firstName;

    @Size(max = 100, message = "Le nom de famille ne peut pas dépasser 100 caractères")
    @Schema(description = "Nom de famille", example = "Martin")
    private String lastName;

    @Email(message = "Format d'email invalide")
    @Schema(description = "Adresse email", example = "marie.martin@vermeg.com")
    private String email;

    @Pattern(regexp = "^\\+?[0-9\\s()-]{8,20}$", message = "Format de téléphone invalide")
    @Schema(description = "Numéro de téléphone", example = "+33123456789")
    private String phone;

    @Size(max = 100, message = "La localisation ne peut pas dépasser 100 caractères")
    @Schema(description = "Localisation/Ville", example = "Lyon, France")
    private String location;

    // === CHAMPS SPÉCIFIQUES RH ADMIN ===

    @Size(max = 100, message = "Le département ne peut pas dépasser 100 caractères")
    @Schema(description = "Département RH", example = "Human Resources")
    private String department;

    @Schema(description = "Spécialisations RH", example = "[\"Recrutement\", \"Formation\", \"Gestion des talents\", \"Paie\"]")
    private List<String> hrSpecializations;

    @Min(value = 0, message = "L'expérience en recrutement ne peut pas être négative")
    @Max(value = 50, message = "L'expérience en recrutement ne peut pas dépasser 50 ans")
    @Schema(description = "Années d'expérience en recrutement", example = "10")
    private Integer recruitmentExperience;

    @Schema(description = "Entreprises précédentes", example = "[\"Accenture\", \"Capgemini\", \"Sopra Steria\", \"Atos\"]")
    private List<String> companiesWorked;

    @Schema(description = "Certifications RH", example = "[\"SHRM-CP\", \"PHR\", \"CIPD\", \"GPEC\"]")
    private List<String> certifications;

    @Schema(description = "Langues parlées", example = "[\"Français\", \"Anglais\", \"Espagnol\", \"Italien\"]")
    private List<String> languages;

    @Schema(description = "Niveau d'accès", example = "INTERNATIONAL")
    private RhAdminProfile.AccessLevel accessLevel;

    @Schema(description = "Départements sous responsabilité", example = "[\"IT\", \"Marketing\", \"Sales\", \"Finance\"]")
    private List<String> responsibleFor;

    @Min(value = 0, message = "Le nombre d'employés gérés ne peut pas être négatif")
    @Schema(description = "Nombre d'employés gérés", example = "200")
    private Integer employeesManaged;

    @Min(value = 0, message = "L'objectif de recrutement ne peut pas être négatif")
    @Schema(description = "Objectif de recrutement annuel", example = "75")
    private Integer recruitmentQuota;
}
