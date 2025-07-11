package com.pfe2025.jobrequisitionservice.config;

import com.pfe2025.jobrequisitionservice.event.RequisitionApprovedEvent;
import com.pfe2025.jobrequisitionservice.event.RequisitionCancelledEvent;
import com.pfe2025.jobrequisitionservice.event.RequisitionFulfilledEvent;
import com.pfe2025.jobrequisitionservice.event.RequisitionStatusChangedEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;

import java.util.function.Function;

/**
 * Configuration des flux de messagerie avec Spring Cloud Stream.
 * Cette classe définit les fonctions de traitement pour les différents
 * types d'événements envoyés et reçus par le service.
 */
@Configuration
public class StreamConfig {

    /**
     * Fonction de traitement des événements de changement de statut.
     * Enrichit les messages avec des en-têtes avant leur publication.
     */
    @Bean
    public Function<RequisitionStatusChangedEvent, Message<RequisitionStatusChangedEvent>> processStatusChangeEvent() {
        return event -> MessageBuilder.withPayload(event)
                .setHeader("eventType", "STATUS_CHANGED")
                .setHeader("requisitionId", event.getRequisitionId())
                .build();
    }

    /**
     * Fonction de traitement des événements d'approbation.
     */
    @Bean
    public Function<RequisitionApprovedEvent, Message<RequisitionApprovedEvent>> processApprovalEvent() {
        return event -> MessageBuilder.withPayload(event)
                .setHeader("eventType", "REQUISITION_APPROVED")
                .setHeader("requisitionId", event.getRequisitionId())
                .build();
    }

    /**
     * Fonction de traitement des événements d'annulation.
     */
    @Bean
    public Function<RequisitionCancelledEvent, Message<RequisitionCancelledEvent>> processCancellationEvent() {
        return event -> MessageBuilder.withPayload(event)
                .setHeader("eventType", "REQUISITION_CANCELLED")
                .setHeader("requisitionId", event.getRequisitionId())
                .build();
    }

    /**
     * Fonction de traitement des événements de complétion.
     */
    @Bean
    public Function<RequisitionFulfilledEvent, Message<RequisitionFulfilledEvent>> processFulfillmentEvent() {
        return event -> MessageBuilder.withPayload(event)
                .setHeader("eventType", "REQUISITION_FULFILLED")
                .setHeader("requisitionId", event.getRequisitionId())
                .build();
    }
}