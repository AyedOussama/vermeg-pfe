package com.pfe2025.jobrequisitionservice.event;

import com.pfe2025.jobrequisitionservice.model.JobLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Événement émis lorsqu'une réquisition est approuvée.
 * Contient toutes les données nécessaires pour la création d'une offre d'emploi.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RequisitionApprovedEvent extends BaseEvent {

    /**
     * Titre du poste
     */
    private String title;

    /**
     * Description du poste
     */
    private String description;

    /**
     * Département concerné
     */
    private String department;

    /**
     * Nom du projet associé
     */
    private String projectName;

    /**
     * ID du chef de projet
     */
    private String projectLeaderId;

    /**
     * Nom du chef de projet
     */
    private String projectLeaderName;

    /**
     * Niveau requis pour le poste
     */
    private JobLevel requiredLevel;

    /**
     * Compétences requises
     */
    private Set<String> requiredSkills;

    /**
     * Expérience minimale en années
     */
    private Integer minExperience;

    /**
     * Date de début prévue
     */
    private LocalDate expectedStartDate;

    /**
     * Indique si le besoin est urgent
     */
    private Boolean isUrgent;

    /**
     * Nombre de postes à pourvoir
     */
    private Integer neededHeadcount;

    /**
     * ID de l'utilisateur ayant approuvé
     */
    private String approvedBy;

    /**
     * Date d'approbation
     */
    private LocalDateTime approvedAt;
}