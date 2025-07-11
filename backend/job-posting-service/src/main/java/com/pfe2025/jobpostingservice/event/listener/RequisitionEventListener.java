package com.pfe2025.jobpostingservice.event.listener;




import com.pfe2025.jobpostingservice.event.RequisitionApprovedEvent;
import com.pfe2025.jobpostingservice.event.RequisitionCancelledEvent;
import com.pfe2025.jobpostingservice.service.JobPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;

import java.util.function.Consumer;

/**
 * Écouteur pour les événements liés aux réquisitions.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class RequisitionEventListener {

    private final JobPostService jobPostService;

    /**
     * Traite les événements d'approbation de réquisition.
     */
    @Bean
    public Consumer<Message<RequisitionApprovedEvent>> processRequisitionApproved() {
        return message -> {
            try {
                RequisitionApprovedEvent event = message.getPayload();
                log.info("Réception d'un événement d'approbation de réquisition: {}", event.getRequisitionId());
                jobPostService.createFromRequisition(event);
            } catch (Exception e) {
                log.error("Erreur lors du traitement de l'événement d'approbation de réquisition", e);
                // En cas d'erreur non gérée, nous rejetons le message pour qu'il soit réessayé plus tard
                throw e;
            }
        };
    }

    /**
     * Traite les événements d'annulation de réquisition.
     */
    @Bean
    public Consumer<Message<RequisitionCancelledEvent>> processRequisitionCancelled() {
        return message -> {
            try {
                RequisitionCancelledEvent event = message.getPayload();
                log.info("Réception d'un événement d'annulation de réquisition: {}", event.getRequisitionId());
                jobPostService.closeJobPostsFromRequisition(event.getRequisitionId(),
                        "Réquisition annulée: " + event.getReason());
            } catch (Exception e) {
                log.error("Erreur lors du traitement de l'événement d'annulation de réquisition", e);
                throw e;
            }
        };
    }
}
