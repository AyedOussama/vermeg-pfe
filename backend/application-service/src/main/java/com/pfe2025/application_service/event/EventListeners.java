package com.pfe2025.application_service.event;


import com.pfe2025.application_service.exception.EventProcessingException;
import com.pfe2025.application_service.service.ApplicationService;
import com.pfe2025.application_service.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.ErrorMessage;
import org.springframework.transaction.annotation.Transactional;

import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * Configuration des écouteurs d'événements.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class EventListeners {

    private final ApplicationService applicationService;
    private final EvaluationService evaluationService;

    /**
     * Écouteur pour les événements d'évaluation de candidature.
     */
    @Bean
    public Consumer<Message<ApplicationEvaluatedEvent>> processApplicationEvaluated() {
        return message -> {
            try {
                ApplicationEvaluatedEvent event = message.getPayload();
                log.info("Receiving application evaluated event for application: {}", event.getApplicationId());
                evaluationService.processEvaluationResult(event);
            } catch (Exception e) {
                log.error("Error processing application evaluated event: {}", e.getMessage(), e);
                // Instead of rethrowing, capture the error for DLQ handling
                captureErrorAndHandleDLQ(message, e, "ApplicationEvaluatedEvent");
            }
        };
    }

    /**
     * Écouteur pour les événements de soumission de candidature.
     */
    @Bean
    public Consumer<Message<ApplicationSubmittedEvent>> processApplicationSubmitted() {
        return message -> {
            try {
                ApplicationSubmittedEvent event = message.getPayload();
                log.info("Receiving application submitted event for candidate: {}, job: {}",
                        event.getCandidateId(), event.getJobPostingId());
                applicationService.processExternalSubmission(event);
            } catch (Exception e) {
                log.error("Error processing application submitted event: {}", e.getMessage(), e);
                captureErrorAndHandleDLQ(message, e, "ApplicationSubmittedEvent");
            }
        };
    }

    /**
     * Écouteur pour les événements de changement de statut de candidature.
     */
    @Bean
    public Consumer<Message<ApplicationStatusChangedEvent>> processApplicationStatusChanged() {
        return message -> {
            try {
                ApplicationStatusChangedEvent event = message.getPayload();
                log.info("Receiving status change event for application: {} to status: {}",
                        event.getApplicationId(), event.getNewStatus());
                applicationService.syncExternalStatusChange(event);
            } catch (Exception e) {
                log.error("Error processing application status changed event: {}", e.getMessage(), e);
                captureErrorAndHandleDLQ(message, e, "ApplicationStatusChangedEvent");
            }
        };
    }

    /**
     * Écouteur pour les événements d'entretien planifié.
     */
    @Bean
    public Consumer<Message<InterviewScheduledEvent>> processInterviewScheduled() {
        return message -> {
            try {
                InterviewScheduledEvent event = message.getPayload();
                log.info("Receiving interview scheduled event for application: {}", event.getApplicationId());
                applicationService.processInterviewScheduled(event);
            } catch (Exception e) {
                log.error("Error processing interview scheduled event: {}", e.getMessage(), e);
                captureErrorAndHandleDLQ(message, e, "InterviewScheduledEvent");
            }
        };
    }

    /**
     * Écouteur pour les événements d'entretien terminé.
     */
    @Bean
    public Consumer<Message<InterviewCompletedEvent>> processInterviewCompleted() {
        return message -> {
            try {
                InterviewCompletedEvent event = message.getPayload();
                log.info("Receiving interview completed event for application: {}", event.getApplicationId());
                applicationService.processInterviewCompleted(event);
            } catch (Exception e) {
                log.error("Error processing interview completed event: {}", e.getMessage(), e);
                captureErrorAndHandleDLQ(message, e, "InterviewCompletedEvent");
            }
        };
    }

    /**
     * Écouteur pour les événements d'entretien annulé.
     */
    @Bean
    public Consumer<Message<InterviewCanceledEvent>> processInterviewCanceled() {
        return message -> {
            try {
                InterviewCanceledEvent event = message.getPayload();
                log.info("Receiving interview canceled event for application: {}", event.getApplicationId());
                applicationService.processInterviewCanceled(event);
            } catch (Exception e) {
                log.error("Error processing interview canceled event: {}", e.getMessage(), e);
                captureErrorAndHandleDLQ(message, e, "InterviewCanceledEvent");
            }
        };
    }

    /**
     * Error handler for consumer functions
     */
    @Bean
    public Function<ErrorMessage, Void> errorHandler() {
        return errorMessage -> {
            log.error("Error in messaging: {}", errorMessage.getPayload().getMessage(), errorMessage.getPayload());
            // You could add more sophisticated error handling here, like notifications
            return null;
        };
    }

    /**
     * Helper method for consistent error handling and DLQ processing
     */
    private void captureErrorAndHandleDLQ(Message<?> message, Exception e, String eventType) {
        // Log the error details with correlation ID if available
        String correlationId = message.getHeaders().containsKey("correlationId") ?
                message.getHeaders().get("correlationId").toString() : "unknown";

        log.error("Error processing {} (correlationId: {}): {}",
                eventType, correlationId, e.getMessage());

        // Instead of throwing, which would trigger redelivery,
        // wrap in a specific exception that can be handled by DLQ policies
        throw new EventProcessingException(
                "Failed to process " + eventType + ": " + e.getMessage(), e);
    }

    /**
     * Supplier for application metrics events.
     */
    @Bean
    public Supplier<ApplicationMetricsEvent> applicationMetricsSupplier() {
        return () -> null; // Events are published imperatively
    }

    /**
     * Fournisseur d'événements de création d'application.
     */
    @Bean
    public Supplier<ApplicationCreatedEvent> applicationCreatedSupplier() {
        return () -> null; // Les événements seront publiés manuellement
    }

    /**
     * Fournisseur d'événements de demande d'évaluation.
     */
    @Bean
    public Supplier<ApplicationEvaluationRequestedEvent> applicationEvaluationRequestedSupplier() {
        return () -> null; // Les événements seront publiés manuellement
    }

    /**
     * Fournisseur d'événements de changement de statut.
     */
    @Bean
    public Supplier<ApplicationStatusChangedEvent> applicationStatusChangedSupplier() {
        return () -> null; // Les événements seront publiés manuellement
    }

    /**
     * Fournisseur d'événements de demande d'entretien.
     */
    @Bean
    public Supplier<InterviewRequestedEvent> interviewRequestedSupplier() {
        return () -> null; // Les événements seront publiés manuellement
    }
}

