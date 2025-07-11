package com.pfe2025.jobpostingservice.dto;



import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import com.pfe2025.jobpostingservice.model.enums.EmploymentType;
import com.pfe2025.jobpostingservice.model.enums.PostingStatus;
import com.pfe2025.jobpostingservice.model.enums.PublicationLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Classes DTO pour les offres d'emploi.
 * Structure avec des classes imbriquées pour différentes finalités.
 */
public class JobPostDTO {

    /**
     * DTO pour les requêtes de création ou mise à jour d'offre d'emploi.
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Données pour la création ou mise à jour d'une offre d'emploi")
    public static class Request {

        @NotBlank(message = "Le titre est obligatoire")
        @Size(min = 5, max = 255, message = "Le titre doit contenir entre 5 et 255 caractères")
        @Schema(description = "Titre du poste", example = "Développeur Full Stack Java/Angular")
        private String title;

        @Schema(description = "Identifiant de la réquisition associée", example = "123")
        private Long requisitionId;

        @NotBlank(message = "Le département est obligatoire")
        @Size(min = 1, max = 100, message = "Le département doit contenir entre 1 et 100 caractères")
        @Schema(description = "Département", example = "IT")
        private String department;

        @Size(max = 255, message = "La localisation ne peut pas dépasser 255 caractères")
        @Schema(description = "Localisation du poste", example = "Paris, France")
        private String location;

        @NotNull(message = "Le type de contrat est obligatoire")
        @Schema(description = "Type de contrat")
        private EmploymentType employmentType;

        @NotBlank(message = "La description est obligatoire")
        @Size(min = 10, max = 10000, message = "La description doit contenir entre 10 et 10000 caractères")
        @Schema(description = "Description détaillée du poste", example = "Nous recherchons un développeur Full Stack...")
        private String description;

        @Size(max = 5000, message = "Les responsabilités ne peuvent pas dépasser 5000 caractères")
        @Schema(description = "Responsabilités liées au poste")
        private String responsibilities;

        @Size(max = 5000, message = "Les qualifications ne peuvent pas dépasser 5000 caractères")
        @Schema(description = "Qualifications requises")
        private String qualifications;

        @Size(max = 5000, message = "Les avantages ne peuvent pas dépasser 5000 caractères")
        @Schema(description = "Avantages offerts")
        private String benefits;

        @Min(value = 0, message = "L'expérience minimale ne peut pas être négative")
        @Schema(description = "Expérience minimale requise en années", example = "2")
        private Integer minExperience;

        @Schema(description = "Salaire minimum", example = "35000.00")
        private BigDecimal salaryRangeMin;

        @Schema(description = "Salaire maximum", example = "45000.00")
        private BigDecimal salaryRangeMax;

        @Schema(description = "Indique si le salaire doit être affiché", example = "true")
        private Boolean displaySalary;

        @Schema(description = "Niveau de publication/visibilité")
        private PublicationLevel publicationLevel;

        @Schema(description = "Identifiant du modèle utilisé", example = "1")
        private Long templateId;

        @Valid
        @Schema(description = "Compétences requises pour le poste")
        @Builder.Default
        private Set<JobPostingSkillDTO> skills = new HashSet<>();

        @Schema(description = "Date d'expiration de l'offre")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Future(message = "La date d'expiration doit être dans le futur")
        private LocalDateTime expiresAt;
    }

    /**
     * DTO pour les réponses contenant les détails complets d'une offre d'emploi.
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Détails complets d'une offre d'emploi")
    public static class Response {

        @Schema(description = "Identifiant unique")
        private Long id;

        @Schema(description = "Titre du poste")
        private String title;

        @Schema(description = "Identifiant de la réquisition associée")
        private Long requisitionId;

        @Schema(description = "Département")
        private String department;

        @Schema(description = "Localisation du poste")
        private String location;

        @Schema(description = "Type de contrat")
        private EmploymentType employmentType;

        @Schema(description = "Description détaillée du poste")
        private String description;

        @Schema(description = "Responsabilités liées au poste")
        private String responsibilities;

        @Schema(description = "Qualifications requises")
        private String qualifications;

        @Schema(description = "Avantages offerts")
        private String benefits;

        @Schema(description = "Expérience minimale requise en années")
        private Integer minExperience;

        @Schema(description = "Salaire minimum")
        private BigDecimal salaryRangeMin;

        @Schema(description = "Salaire maximum")
        private BigDecimal salaryRangeMax;

        @Schema(description = "Indique si le salaire est affiché")
        private Boolean displaySalary;

        @Schema(description = "Statut actuel de l'offre")
        private PostingStatus status;

        @Schema(description = "Niveau de publication/visibilité")
        private PublicationLevel publicationLevel;

        @Schema(description = "Identifiant du modèle utilisé")
        private Long templateId;

        @Schema(description = "Date de création")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @Schema(description = "Date de publication")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime publishedAt;

        @Schema(description = "Date d'expiration")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime expiresAt;

        @Schema(description = "Date de clôture")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime closedAt;

        @Schema(description = "Identifiant du créateur")
        private String createdBy;

        @Schema(description = "Compétences requises pour le poste")
        @Builder.Default
        private Set<JobPostingSkillDTO> skills = new HashSet<>();

        @Schema(description = "Métriques de l'offre d'emploi")
        private PostingMetricsDTO metrics;

        @Schema(description = "Version (pour le verrouillage optimiste)")
        private Integer version;
    }

    /**
     * DTO pour la vue publique des offres d'emploi.
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Vue publique d'une offre d'emploi")
    public static class PublicView {

        @Schema(description = "Identifiant unique")
        private Long id;

        @Schema(description = "Titre du poste")
        private String title;

        @Schema(description = "Département")
        private String department;

        @Schema(description = "Localisation du poste")
        private String location;

        @Schema(description = "Type de contrat")
        private EmploymentType employmentType;

        @Schema(description = "Description détaillée du poste")
        private String description;

        @Schema(description = "Responsabilités liées au poste")
        private String responsibilities;

        @Schema(description = "Qualifications requises")
        private String qualifications;

        @Schema(description = "Avantages offerts")
        private String benefits;

        @Schema(description = "Expérience minimale requise en années")
        private Integer minExperience;

        @Schema(description = "Plage salariale (si affichée)")
        private String salaryRange;

        @Schema(description = "Date de publication")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime publishedAt;

        @Schema(description = "Compétences requises pour le poste")
        @Builder.Default
        private Set<JobPostingSkillDTO> skills = new HashSet<>();
    }

    /**
     * DTO pour les résumés d'offres d'emploi (utilisé dans les listes).
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Résumé d'une offre d'emploi pour les listings")
    public static class Summary {

        @Schema(description = "Identifiant unique")
        private Long id;

        @Schema(description = "Titre du poste")
        private String title;

        @Schema(description = "Département")
        private String department;

        @Schema(description = "Localisation du poste")
        private String location;

        @Schema(description = "Type de contrat")
        private EmploymentType employmentType;

        @Schema(description = "Statut actuel de l'offre")
        private PostingStatus status;

        @Schema(description = "Date de création")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @Schema(description = "Date de publication")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime publishedAt;

        @Schema(description = "Nombre de candidatures")
        private Integer applicationCount;
    }

    /**
     * DTO pour les demandes de publication d'offre.
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Données pour la publication d'une offre d'emploi")
    public static class PublishRequest {

        @NotNull(message = "La date d'expiration est obligatoire")
        @Future(message = "La date d'expiration doit être dans le futur")
        @Schema(description = "Date d'expiration de l'offre")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime expiresAt;

        @Schema(description = "Niveau de publication/visibilité")
        private PublicationLevel publicationLevel;
    }

    /**
     * DTO pour les demandes de clôture d'offre.
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Données pour la clôture d'une offre d'emploi")
    public static class CloseRequest {

        @NotBlank(message = "La raison de clôture est obligatoire")
        @Size(max = 1000, message = "La raison ne peut pas dépasser 1000 caractères")
        @Schema(description = "Raison de la clôture", example = "Poste pourvu")
        private String reason;
    }
}
