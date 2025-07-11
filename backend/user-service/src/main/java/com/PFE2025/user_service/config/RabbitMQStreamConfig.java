package com.PFE2025.user_service.config;

import com.PFE2025.user_service.dto.event.CvParsedEventDto;
import com.PFE2025.user_service.service.CvDataEnrichmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.acks.AcknowledgmentCallback;
import org.springframework.integration.IntegrationMessageHeaderAccessor;
import org.springframework.messaging.Message;

import java.util.function.Consumer;

/**
 * Configuration RabbitMQ Stream pour consommer les événements CV_PARSED.
 * Écoute les événements depuis ai-processing-service et enrichit les profils candidats.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class RabbitMQStreamConfig {
    
    private final CvDataEnrichmentService cvDataEnrichmentService;
    
    /**
     * Bean Consumer pour l'entrée 'processCvParsedEvent-in-0'.
     * Gère la réception des événements CV_PARSED et délègue l'enrichissement au service.
     */
    @Bean
    public Consumer<Message<CvParsedEventDto>> processCvParsedEvent() {
        return message -> {
            CvParsedEventDto event = message.getPayload();
            String keycloakId = event.getKeycloakId();
            Long documentId = event.getDocumentId();
            
            // Récupérer le callback d'acknowledgment depuis les headers du message
            AcknowledgmentCallback acknowledgmentCallback =
                message.getHeaders().get(IntegrationMessageHeaderAccessor.ACKNOWLEDGMENT_CALLBACK, AcknowledgmentCallback.class);
            
            log.info("📨 ÉVÉNEMENT REÇU - CV_PARSED pour keycloakId: {}, documentId: {}", keycloakId, documentId);
            
            // Validation de base de l'événement
            if (keycloakId == null || keycloakId.isBlank()) {
                log.warn("⚠️ ÉVÉNEMENT IGNORÉ - keycloakId manquant pour documentId: {}", documentId);
                if (acknowledgmentCallback != null) {
                    acknowledgmentCallback.acknowledge(AcknowledgmentCallback.Status.ACCEPT);
                }
                return;
            }
            
            if (!"CV_PARSED".equals(event.getEventType())) {
                log.warn("⚠️ ÉVÉNEMENT IGNORÉ - Type d'événement non supporté: {} pour keycloakId: {}", 
                        event.getEventType(), keycloakId);
                if (acknowledgmentCallback != null) {
                    acknowledgmentCallback.acknowledge(AcknowledgmentCallback.Status.ACCEPT);
                }
                return;
            }
            
            try {
                // Appeler le service d'enrichissement
                log.info("🔄 DÉBUT TRAITEMENT - Enrichissement du profil pour keycloakId: {}", keycloakId);
                
                cvDataEnrichmentService.enrichCandidateProfile(event);
                
                log.info("✅ TRAITEMENT RÉUSSI - Profil enrichi avec succès pour keycloakId: {}", keycloakId);
                
                // Acquitter le message SEULEMENT après succès complet
                if (acknowledgmentCallback != null) {
                    acknowledgmentCallback.acknowledge(AcknowledgmentCallback.Status.ACCEPT);
                    log.debug("📝 MESSAGE ACQUITTÉ - keycloakId: {}", keycloakId);
                }
                
            } catch (Exception error) {
                log.error("❌ ÉCHEC TRAITEMENT - Enrichissement échoué pour keycloakId: {} - {}", 
                        keycloakId, error.getMessage(), error);
                
                // Rejeter le message pour qu'il soit retraité ou envoyé en DLQ
                if (acknowledgmentCallback != null) {
                    acknowledgmentCallback.acknowledge(AcknowledgmentCallback.Status.REJECT);
                    log.debug("🔄 MESSAGE REJETÉ - Sera retraité ou envoyé en DLQ pour keycloakId: {}", keycloakId);
                }
                
                // Ne pas propager l'exception pour éviter d'arrêter le consumer
                // L'acknowledgment REJECT s'occupera du retry/DLQ
            }
        };
    }
}
