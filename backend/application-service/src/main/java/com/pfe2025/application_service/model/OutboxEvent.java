package com.pfe2025.application_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Entité pour implémenter le pattern Outbox pour la communication événementielle.
 */
@Entity
@Table(name = "outbox_events")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OutboxEvent extends BaseEntity {

    @Column(nullable = false)
    private String aggregateType; // ex: "application"

    @Column(nullable = false)
    private Long aggregateId; // ex: ID de l'application

    @Column(nullable = false)
    private String eventType; // ex: "ApplicationStatusChanged"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload; // JSON sérialisé de l'événement

    @Column(nullable = false)
    private Boolean processed;

    private LocalDateTime processedAt;

    private Integer retryCount;

    private String errorMessage;

    @Column(nullable = false)
    private LocalDateTime creationTime;
}