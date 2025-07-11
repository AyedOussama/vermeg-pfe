package com.pfe2025.jobrequisitionservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.pfe2025.jobrequisitionservice.model.JobLevel;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Classes DTO pour les réquisitions de poste.
 * Structure avec des classes imbriquées pour différentes finalités.
 */
public class JobRequisitionDto {

    /**
     * DTO pour les requêtes de création ou mise à jour de réquisition.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Le titre est obligatoire")
        @Size(min = 5, max = 100, message = "Le titre doit contenir entre 5 et 100 caractères")
        @Schema(description = "Titre du poste", example = "Développeur Full Stack Java/Angular")
        private String title;

        @NotBlank(message = "La description est obligatoire")
        @Size(min = 10, max = 2000, message = "La description doit contenir entre 10 et 2000 caractères")
        @Schema(description = "Description détaillée du poste", example = "Nous recherchons un développeur Full Stack...")
        private String description;

        @NotBlank(message = "Le département est obligatoire")
        @Schema(description = "Département", example = "IT")
        private String department;

        @Schema(description = "Nom du projet concerné", example = "PROJ-123")
        private String projectName;

        @NotNull(message = "Le niveau requis est obligatoire")
        @Schema(description = "Niveau d'expérience requis")
        private JobLevel requiredLevel;

        @Schema(description = "Compétences requises pour le poste")
        @Builder.Default
        private Set<String> requiredSkills = new HashSet<>();

        @Min(value = 0, message = "L'expérience minimale ne peut pas être négative")
        @Schema(description = "Expérience minimale requise en années", example = "2")
        private Integer minExperience;

        @Future(message = "La date de début prévue doit être dans le futur")
        @JsonFormat(pattern = "yyyy-MM-dd")
        @Schema(description = "Date de début prévue", example = "2023-06-01")
        private LocalDate expectedStartDate;

        @Schema(description = "Indique si le besoin est urgent", example = "true")
        private boolean urgent;

        @NotNull(message = "Le nombre de postes à pourvoir est obligatoire")
        @Min(value = 1, message = "Il doit y avoir au moins un poste à pourvoir")
        @Schema(description = "Nombre de postes à pourvoir", example = "3")
        private Integer neededHeadcount;
    }

    /**
     * DTO pour les réponses contenant les détails complets d'une réquisition.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        @Schema(description = "Identifiant unique")
        private Long id;

        @Schema(description = "Titre du poste")
        private String title;

        @Schema(description = "Description détaillée du poste")
        private String description;

        @Schema(description = "Département")
        private String department;

        @Schema(description = "Nom du projet concerné")
        private String projectName;

        @Schema(description = "ID du chef de projet")
        private String projectLeaderId;

        @Schema(description = "Nom du chef de projet")
        private String projectLeaderName;

        @Schema(description = "Niveau d'expérience requis")
        private JobLevel requiredLevel;

        @Schema(description = "Compétences requises pour le poste")
        private Set<String> requiredSkills;

        @Schema(description = "Expérience minimale requise en années")
        private Integer minExperience;

        @Schema(description = "Date de début prévue")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate expectedStartDate;

        @Schema(description = "Indique si le besoin est urgent")
        private boolean urgent;

        @Schema(description = "Nombre de postes à pourvoir")
        private Integer neededHeadcount;

        @Schema(description = "Statut actuel de la demande")
        private RequisitionStatus status;

        @Schema(description = "ID du CEO qui a approuvé/rejeté la demande")
        private String ceoId;

        @Schema(description = "Date de réponse du CEO")
        private LocalDateTime ceoResponseDate;

        @Schema(description = "Raison du rejet (si applicable)")
        private String rejectionReason;

        @Schema(description = "Date de création")
        private LocalDateTime createdAt;

        @Schema(description = "Date de dernière modification")
        private LocalDateTime updatedAt;

        @Schema(description = "Historique des changements de statut")
        private Set<StatusHistoryResponseDto> statusHistory;
    }

    /**
     * DTO pour les décisions du CEO (approbation/rejet).
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CeoDecision {
        @NotNull(message = "La décision est obligatoire")
        @Schema(description = "Indique si la demande est approuvée ou rejetée", example = "true")
        private boolean approved;

        @Size(max = 1000, message = "La raison du rejet ne peut pas dépasser 1000 caractères")
        @Schema(description = "Raison du rejet (obligatoire si rejetée)", example = "Budget insuffisant pour ce poste")
        private String rejectionReason;
    }
}