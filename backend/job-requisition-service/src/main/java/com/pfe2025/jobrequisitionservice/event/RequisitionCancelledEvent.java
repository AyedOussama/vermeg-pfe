package com.pfe2025.jobrequisitionservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Événement émis lorsqu'une réquisition est annulée.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RequisitionCancelledEvent extends BaseEvent {

    /**
     * Titre de la réquisition annulée
     */
    private String title;

    /**
     * Nom de l'utilisateur ayant annulé
     */
    private String cancelledBy;

    /**
     * Raison de l'annulation
     */
    private String reason;

    /**
     * Date d'annulation
     */
    private LocalDateTime cancelledAt;
}