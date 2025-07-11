package com.pfe2025.jobpostingservice.event.listener;



import com.pfe2025.jobpostingservice.event.ApplicationSubmittedEvent;
import com.pfe2025.jobpostingservice.service.MetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;

import java.util.function.Consumer;

/**
 * Écouteur pour les événements liés aux candidatures.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class ApplicationEventListener {

    private final MetricsService metricsService;

    /**
     * Traite les événements de soumission de candidature.
     */
    @Bean
    public Consumer<Message<ApplicationSubmittedEvent>> processApplicationSubmitted() {
        return message -> {
            try {
                ApplicationSubmittedEvent event = message.getPayload();
                log.info("Réception d'un événement de soumission de candidature pour l'offre: {}", event.getJobPostId());
                metricsService.incrementApplicationCount(event.getJobPostId());
            } catch (Exception e) {
                log.error("Erreur lors du traitement de l'événement de soumission de candidature", e);
                throw e;
            }
        };
    }
}
