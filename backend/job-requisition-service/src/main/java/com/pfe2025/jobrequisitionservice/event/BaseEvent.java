package com.pfe2025.jobrequisitionservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Classe de base pour tous les événements liés aux réquisitions.
 * Contient les attributs communs à tous les types d'événements.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class BaseEvent {

    /**
     * Identifiant unique de l'événement
     */
    private String eventId;

    /**
     * Horodatage de l'événement
     */
    private LocalDateTime timestamp;

    /**
     * Type d'événement
     */
    private String eventType;

    /**
     * Identifiant de la réquisition concernée
     */
    private Long requisitionId;
}