package com.pfe2025.application_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe2025.application_service.model.OutboxEvent;
import com.pfe2025.application_service.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxProcessorService {

    private final OutboxEventRepository outboxRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelay = 5000) // Toutes les 5 secondes
    @Transactional
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxRepository.findByProcessedFalseOrderByCreationTimeAsc();

        for (OutboxEvent event : pendingEvents) {
            try {
                // Déterminer la routing key en fonction du type d'événement
                String routingKey = determineRoutingKey(event.getEventType());

                // Publier l'événement dans RabbitMQ
                rabbitTemplate.convertAndSend(
                        "vermeg.recruitment", // Exchange name
                        routingKey,
                        event.getPayload()
                );

                // Marquer comme traité
                event.setProcessed(true);
                event.setProcessedAt(LocalDateTime.now());
                outboxRepository.save(event);

                log.debug("Successfully processed outbox event: {}", event.getId());

            } catch (Exception e) {
                // Incrémenter le compteur de tentatives
                event.setRetryCount(event.getRetryCount() + 1);
                event.setErrorMessage(e.getMessage());

                // Si trop de tentatives, marquer comme échoué mais traité
                if (event.getRetryCount() >= 5) {
                    event.setProcessed(true);
                    log.error("Failed to process outbox event after 5 attempts: {}", event.getId(), e);
                } else {
                    log.warn("Failed to process outbox event (attempt {}): {}",
                            event.getRetryCount(), event.getId(), e);
                }

                outboxRepository.save(event);
            }
        }
    }

    private String determineRoutingKey(String eventType) {
        return switch (eventType) {
            case "ApplicationCreated" -> "application.created";
            case "ApplicationStatusChanged" -> "application.status-changed";
            case "InterviewRequested" -> "interview.requested";
            case "ApplicationEvaluationRequested" -> "application.evaluation-requested";
            case "ApplicationMetrics" -> "application.metrics";
            default -> "events.generic";
        };
    }

    @Transactional
    public void saveEvent(String aggregateType, Long aggregateId, String eventType, String payload) {
        OutboxEvent event = new OutboxEvent();
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setEventType(eventType);
        event.setPayload(payload);
        event.setProcessed(false);
        event.setRetryCount(0);
        event.setCreationTime(LocalDateTime.now());

        outboxRepository.save(event);
        log.debug("Saved outbox event: {} for {}", eventType, aggregateId);
    }
}