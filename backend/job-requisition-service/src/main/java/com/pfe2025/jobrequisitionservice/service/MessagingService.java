package com.pfe2025.jobrequisitionservice.service;

import com.pfe2025.jobrequisitionservice.dto.JobRequisitionSummaryDTO;
import com.pfe2025.jobrequisitionservice.event.RequisitionApprovedEvent;
import com.pfe2025.jobrequisitionservice.event.RequisitionCancelledEvent;
import com.pfe2025.jobrequisitionservice.event.RequisitionFulfilledEvent;
import com.pfe2025.jobrequisitionservice.event.RequisitionStatusChangedEvent;
import com.pfe2025.jobrequisitionservice.model.JobRequisition;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service responsable de l'envoi des événements via le système de messagerie.
 * Utilise Spring Cloud Stream avec RabbitMQ Stream pour une communication fiable.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingService {

    private final StreamBridge streamBridge;

    /**
     * Publie un événement de changement de statut
     */
    @CircuitBreaker(name = "eventPublisher", fallbackMethod = "fallbackStatusChange")
    @Retry(name = "eventPublisher")
    public void publishStatusChangeEvent(RequisitionStatusChangedEvent event) {
        log.debug("Publication d'un événement de changement de statut pour la réquisition ID: {}", event.getRequisitionId());
        boolean sent = streamBridge.send("processStatusChangeEvent-out-0", event);

        if (!sent) {
            log.error("Échec de l'envoi de l'événement de changement de statut pour la réquisition ID: {}", event.getRequisitionId());
            throw new RuntimeException("Échec de la publication de l'événement de changement de statut");
        }

        log.info("Événement de changement de statut publié avec succès pour la réquisition ID: {}", event.getRequisitionId());
    }

    /**
     * Méthode de fallback pour le circuit breaker lors d'un échec de publication d'événement de statut
     */
    public void fallbackStatusChange(RequisitionStatusChangedEvent event, Throwable t) {
        log.warn("Circuit breaker activé pour l'événement de changement de statut. Réquisition ID: {}, Erreur: {}",
                event.getRequisitionId(), t.getMessage());
        // Ici on pourrait implémenter une stratégie de fallback comme stocker l'événement en base de données
    }

    /**
     * Publie un événement d'approbation de réquisition
     */
    @CircuitBreaker(name = "eventPublisher", fallbackMethod = "fallbackApproval")
    @Retry(name = "eventPublisher")
    public void publishApprovalEvent(RequisitionApprovedEvent event) {
        log.debug("Publication d'un événement d'approbation pour la réquisition ID: {}", event.getRequisitionId());
        boolean sent = streamBridge.send("processApprovalEvent-out-0", event);

        if (!sent) {
            log.error("Échec de l'envoi de l'événement d'approbation pour la réquisition ID: {}", event.getRequisitionId());
            throw new RuntimeException("Échec de la publication de l'événement d'approbation");
        }

        log.info("Événement d'approbation publié avec succès pour la réquisition ID: {}", event.getRequisitionId());
    }

    /**
     * Méthode de fallback pour le circuit breaker lors d'un échec de publication d'événement d'approbation
     */
    public void fallbackApproval(RequisitionApprovedEvent event, Throwable t) {
        log.warn("Circuit breaker activé pour l'événement d'approbation. Réquisition ID: {}, Erreur: {}",
                event.getRequisitionId(), t.getMessage());
    }

    /**
     * Publie un événement d'annulation de réquisition
     */
    @CircuitBreaker(name = "eventPublisher", fallbackMethod = "fallbackCancellation")
    @Retry(name = "eventPublisher")
    public void publishCancellationEvent(RequisitionCancelledEvent event) {
        log.debug("Publication d'un événement d'annulation pour la réquisition ID: {}", event.getRequisitionId());
        boolean sent = streamBridge.send("processCancellationEvent-out-0", event);

        if (!sent) {
            log.error("Échec de l'envoi de l'événement d'annulation pour la réquisition ID: {}", event.getRequisitionId());
            throw new RuntimeException("Échec de la publication de l'événement d'annulation");
        }

        log.info("Événement d'annulation publié avec succès pour la réquisition ID: {}", event.getRequisitionId());
    }

    /**
     * Méthode de fallback pour le circuit breaker lors d'un échec de publication d'événement d'annulation
     */
    public void fallbackCancellation(RequisitionCancelledEvent event, Throwable t) {
        log.warn("Circuit breaker activé pour l'événement d'annulation. Réquisition ID: {}, Erreur: {}",
                event.getRequisitionId(), t.getMessage());
    }

    /**
     * Publie un événement de réquisition pourvue
     */
    @CircuitBreaker(name = "eventPublisher", fallbackMethod = "fallbackFulfillment")
    @Retry(name = "eventPublisher")
    public void publishFulfillmentEvent(RequisitionFulfilledEvent event) {
        log.debug("Publication d'un événement de réquisition pourvue pour la réquisition ID: {}", event.getRequisitionId());
        boolean sent = streamBridge.send("processFulfillmentEvent-out-0", event);

        if (!sent) {
            log.error("Échec de l'envoi de l'événement de réquisition pourvue pour la réquisition ID: {}", event.getRequisitionId());
            throw new RuntimeException("Échec de la publication de l'événement de réquisition pourvue");
        }

        log.info("Événement de réquisition pourvue publié avec succès pour la réquisition ID: {}", event.getRequisitionId());
    }

    /**
     * Méthode de fallback pour le circuit breaker lors d'un échec de publication d'événement de réquisition pourvue
     */
    public void fallbackFulfillment(RequisitionFulfilledEvent event, Throwable t) {
        log.warn("Circuit breaker activé pour l'événement de réquisition pourvue. Réquisition ID: {}, Erreur: {}",
                event.getRequisitionId(), t.getMessage());
    }

    /**
     * Crée un événement de changement de statut.
     *
     * @param requisition La réquisition concernée
     * @param oldStatus L'ancien statut
     * @param newStatus Le nouveau statut
     * @param changedByName Le nom de l'utilisateur ayant effectué le changement
     * @param comments Les commentaires associés au changement
     * @return L'événement créé
     */
    public RequisitionStatusChangedEvent createStatusChangedEvent(
            JobRequisition requisition,
            RequisitionStatus oldStatus,
            RequisitionStatus newStatus,
            String changedByName,
            String comments,
            JobRequisitionSummaryDTO summary) {

        RequisitionStatusChangedEvent event = RequisitionStatusChangedEvent.builder()
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedByName(changedByName)
                .comments(comments)
                .requisitionSummary(summary)
                .build();

        // Données communes à tous les événements
        event.setEventId(UUID.randomUUID().toString());
        event.setTimestamp(LocalDateTime.now());
        event.setEventType("REQUISITION_STATUS_CHANGED");
        event.setRequisitionId(requisition.getId());

        return event;
    }

    /**
     * Crée un événement d'approbation de réquisition.
     */
    public RequisitionApprovedEvent createApprovalEvent(JobRequisition requisition, String approvedBy) {
        RequisitionApprovedEvent event = RequisitionApprovedEvent.builder()
                .title(requisition.getTitle())
                .description(requisition.getDescription())
                .department(requisition.getDepartment())
                .projectName(requisition.getProjectName())
                .projectLeaderId(requisition.getProjectLeaderId())
                .projectLeaderName(requisition.getProjectLeaderName())
                .requiredLevel( requisition.getRequiredLevel())
                .requiredSkills(requisition.getRequiredSkills())
                .minExperience(requisition.getMinExperience())
                .expectedStartDate(requisition.getExpectedStartDate())
                .isUrgent(requisition.getUrgent())
                .neededHeadcount(requisition.getNeededHeadcount())
                .approvedBy(approvedBy)
                .approvedAt(LocalDateTime.now())
                .build();

        // Données communes à tous les événements
        event.setEventId(UUID.randomUUID().toString());
        event.setTimestamp(LocalDateTime.now());
        event.setEventType("REQUISITION_APPROVED");
        event.setRequisitionId(requisition.getId());

        return event;
    }

    /**
     * Crée un événement d'annulation de réquisition.
     */
    public RequisitionCancelledEvent createCancellationEvent(JobRequisition requisition, String cancelledBy, String reason) {
        RequisitionCancelledEvent event = RequisitionCancelledEvent.builder()
                .title(requisition.getTitle())
                .cancelledBy(cancelledBy)
                .reason(reason)
                .cancelledAt(LocalDateTime.now())
                .build();

        // Données communes à tous les événements
        event.setEventId(UUID.randomUUID().toString());
        event.setTimestamp(LocalDateTime.now());
        event.setEventType("REQUISITION_CANCELLED");
        event.setRequisitionId(requisition.getId());

        return event;
    }

    /**
     * Crée un événement de réquisition pourvue.
     */
    public RequisitionFulfilledEvent createFulfillmentEvent(JobRequisition requisition, String fulfilledBy) {
        RequisitionFulfilledEvent event = RequisitionFulfilledEvent.builder()
                .title(requisition.getTitle())
                .department(requisition.getDepartment())
                .neededHeadcount(requisition.getNeededHeadcount())
                .fulfilledBy(fulfilledBy)
                .fulfilledAt(LocalDateTime.now())
                .build();

        // Données communes à tous les événements
        event.setEventId(UUID.randomUUID().toString());
        event.setTimestamp(LocalDateTime.now());
        event.setEventType("REQUISITION_FULFILLED");
        event.setRequisitionId(requisition.getId());

        return event;
    }
}
