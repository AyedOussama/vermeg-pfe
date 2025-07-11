package com.pfe2025.jobrequisitionservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Événement émis lorsqu'une réquisition est pourvue.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RequisitionFulfilledEvent extends BaseEvent {

    /**
     * Titre de la réquisition pourvue
     */
    private String title;

    /**
     * Département concerné
     */
    private String department;

    /**
     * Nombre de postes pourvus
     */
    private Integer neededHeadcount;

    /**
     * Nom de l'utilisateur ayant marqué comme pourvue
     */
    private String fulfilledBy;

    /**
     * Date à laquelle la réquisition a été marquée comme pourvue
     */
    private LocalDateTime fulfilledAt;
}