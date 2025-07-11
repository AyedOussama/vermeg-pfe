package com.pfe2025.ai_processing_service.config;


import com.pfe2025.ai_processing_service.dto.DocumentEventDto;
import com.pfe2025.ai_processing_service.dto.ProcessingErrorEventDto; // DTO pour l'erreur
import com.pfe2025.ai_processing_service.service.AiProcessorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.integration.acks.AcknowledgmentCallback;
import org.springframework.integration.IntegrationMessageHeaderAccessor;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.util.function.Consumer;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class RabbitMQStreamConfig {

    private final AiProcessorService aiProcessorService;
    private final StreamBridge streamBridge;

    private static final String CV_PARSED_BINDING = "cvParsed-out-0";
    // Optionnel: Binding pour publier les erreurs de traitement
    private static final String PROCESSING_FAILED_BINDING = "processingFailed-out-0";

    /**
     * Bean Consumer pour l'entrée 'processDocumentEvent-in-0'.
     * Gère la réception des messages et délègue le traitement au service.
     * AMÉLIORATION: Gestion d'erreur plus robuste. Si le traitement échoue,
     * l'exception sera propagée, ce qui (selon la configuration du binder)
     * peut déclencher un retry ou envoyer le message en DLQ.
     * On ajoute aussi une publication explicite d'un événement d'erreur.
     */
    @Bean
    public Consumer<Message<DocumentEventDto>> processDocumentEvent() {
        return message -> {
            DocumentEventDto event = message.getPayload();
            Long documentId = event.getDocumentId();

            // Récupérer le callback d'acknowledgment depuis les headers du message
            AcknowledgmentCallback acknowledgmentCallback =
                message.getHeaders().get(IntegrationMessageHeaderAccessor.ACKNOWLEDGMENT_CALLBACK, AcknowledgmentCallback.class);

            log.info("Received DOCUMENT_UPLOADED event via Stream for documentId: {}", documentId);

            if (!"CV".equalsIgnoreCase(event.getDocumentType())) {
                log.warn("Received event for non-CV document type for documentId: {}. Skipping.", documentId);
                // Acquitter le message car on ne le traitera jamais
                if (acknowledgmentCallback != null) {
                    acknowledgmentCallback.acknowledge(AcknowledgmentCallback.Status.ACCEPT);
                }
                return;
            }

            // Appeler le service de traitement avec acknowledgment manuel
            aiProcessorService.processCvAndPublishResult(event)
                    .subscribeOn(Schedulers.boundedElastic())
                    .doOnSuccess(aVoid -> {
                        log.info("Successfully processed and published result for documentId: {}", documentId);
                        // Acquitter le message SEULEMENT après succès complet
                        if (acknowledgmentCallback != null) {
                            acknowledgmentCallback.acknowledge(AcknowledgmentCallback.Status.ACCEPT);
                            log.debug("Message acknowledged for documentId: {}", documentId);
                        }
                    })
                    .doOnError(error -> {
                        log.error("Processing pipeline failed for documentId {}: {}", documentId, error.getMessage(), error);
                        // Publier un événement d'échec spécifique
                        publishProcessingFailedEvent(event, error);
                        // Rejeter le message pour qu'il soit retraité ou envoyé en DLQ
                        if (acknowledgmentCallback != null) {
                            acknowledgmentCallback.acknowledge(AcknowledgmentCallback.Status.REJECT);
                            log.debug("Message rejected for retry/DLQ for documentId: {}", documentId);
                        }
                    })
                    .subscribe(); // Déclencher l'exécution
        };
    }

    /**
     * Méthode utilitaire pour publier un événement d'échec.
     */
    private void publishProcessingFailedEvent(DocumentEventDto originalEvent, Throwable error) {
        try {
            ProcessingErrorEventDto errorEvent = ProcessingErrorEventDto.builder()
                    .documentId(originalEvent.getDocumentId())
                    .keycloakId(originalEvent.getKeycloakId())
                    .originalEventType("document.cv.uploaded") // Type d'événement original
                    .errorMessage(error.getMessage())
                    // Ajouter plus de détails si nécessaire (ex: stack trace tronquée)
                    .errorTimestamp(LocalDateTime.now())
                    .build();

            // Essayer d'envoyer l'événement d'erreur (sans garantie forte)
            boolean sent = streamBridge.send(PROCESSING_FAILED_BINDING, MessageBuilder.withPayload(errorEvent).build());
            if (sent) {
                log.info("Published CV_PROCESSING_FAILED event for documentId: {}", originalEvent.getDocumentId());
            } else {
                log.error("Failed to publish CV_PROCESSING_FAILED event for documentId: {}", originalEvent.getDocumentId());
            }
        } catch (Exception e) {
            log.error("Exception while trying to publish CV_PROCESSING_FAILED event for documentId: {}", originalEvent.getDocumentId(), e);
        }
    }
}