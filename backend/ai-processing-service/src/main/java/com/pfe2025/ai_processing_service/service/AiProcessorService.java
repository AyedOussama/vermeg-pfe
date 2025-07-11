package com.pfe2025.ai_processing_service.service;

import com.pfe2025.ai_processing_service.config.TogetherAiConfig; // Injecter pour métadonnées
import com.pfe2025.ai_processing_service.dto.CvParsedEventDto;
import com.pfe2025.ai_processing_service.dto.DocumentEventDto;
import com.pfe2025.ai_processing_service.exception.DocumentFetchException;
import com.pfe2025.ai_processing_service.util.JsonParserUtil;
// CORRECTION: Suppression de l'import @RequiredArgsConstructor
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import java.nio.ByteBuffer;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@Slf4j
// CORRECTION: Suppression de @RequiredArgsConstructor
public class AiProcessorService {

    private final PdfTextExtractor pdfTextExtractor;
    private final TogetherAiClient togetherAiClient;
    private final JsonParserUtil jsonParserUtil;
    private final StreamBridge streamBridge;
    private final LanguageDetectorService languageDetectorService;
    private final TogetherAiConfig togetherAiConfig; // Injecter pour le nom du modèle

    @Qualifier("documentServiceWebClient") // Qualifier pour choisir le bon WebClient
    private final WebClient documentServiceWebClient;

    private static final String CV_PARSED_BINDING = "cvParsed-out-0";
    // private static final String PROCESSING_FAILED_BINDING = "processingFailed-out-0"; // Si on publie les erreurs

    // CORRECTION: Ajout du constructeur explicite
    public AiProcessorService(PdfTextExtractor pdfTextExtractor,
                              TogetherAiClient togetherAiClient,
                              JsonParserUtil jsonParserUtil,
                              StreamBridge streamBridge,
                              LanguageDetectorService languageDetectorService,
                              TogetherAiConfig togetherAiConfig,
                              @Qualifier("documentServiceWebClient") WebClient documentServiceWebClient) {
        this.pdfTextExtractor = pdfTextExtractor;
        this.togetherAiClient = togetherAiClient;
        this.jsonParserUtil = jsonParserUtil;
        this.streamBridge = streamBridge;
        this.languageDetectorService = languageDetectorService;
        this.togetherAiConfig = togetherAiConfig;
        this.documentServiceWebClient = documentServiceWebClient;
    }
    /**
     * Orchestre le traitement complet d'un événement de document CV.
     * Télécharge, extrait, détecte la langue, appelle l'IA, parse et publie le résultat.
     * AMÉLIORATION: La gestion d'erreur est laissée à la propagation pour retry/DLQ.
     *
     * @param event L'événement DocumentEventDto reçu.
     * @return Un Mono<Void> qui se termine quand le traitement est fini (succès ou échec propagé).
     */
    public Mono<Void> processCvAndPublishResult(DocumentEventDto event) {
        long startTime = System.currentTimeMillis();
        log.info("Starting CV processing pipeline for documentId: {}", event.getDocumentId());

        // 1. Télécharger le PDF en byte[]
        return downloadPdfAsBytes(event.getDocumentId())
                // 2. Extraire le texte du PDF
                .flatMap(pdfBytes -> {
                    log.info("📄 EXTRACTION DE TEXTE - Document ID: {}", event.getDocumentId());
                    log.info("   📦 Taille PDF: {} bytes", pdfBytes.length);
                    return pdfTextExtractor.extractText(pdfBytes)
                            .doOnSuccess(text -> {
                                log.info("✅ EXTRACTION RÉUSSIE - Document ID: {}", event.getDocumentId());
                                log.info("   📝 Longueur du texte extrait: {} caractères", text.length());
                                log.info("   🔍 Aperçu du texte (100 premiers caractères): {}",
                                        text.length() > 100 ? text.substring(0, 100) + "..." : text);
                            });
                })
                // 3. Détecter la langue et la passer avec le texte
                .flatMap(cvText -> {
                    log.info("🌍 DÉTECTION DE LANGUE - Document ID: {}", event.getDocumentId());
                    return languageDetectorService.detectLanguage(cvText.substring(0, Math.min(cvText.length(), 1000)))
                            .doOnSuccess(lang -> log.info("✅ LANGUE DÉTECTÉE: {} - Document ID: {}", lang, event.getDocumentId()))
                            .map(lang -> Tuples.of(cvText, lang)); // Tuple<String, String>
                })
                // 4. Appeler l'IA et passer sa réponse JSON et la langue détectée
                .flatMap(textAndLangTuple -> {
                    String cvText = textAndLangTuple.getT1();
                    String detectedLanguage = textAndLangTuple.getT2();
                    log.info("🤖 ANALYSE IA - Document ID: {}", event.getDocumentId());
                    log.info("   🌍 Langue: {}", detectedLanguage);
                    log.info("   📝 Longueur du texte à analyser: {} caractères", cvText.length());
                    return togetherAiClient.extractCvDataFromText(cvText, detectedLanguage)
                            .doOnSuccess(response -> {
                                log.info("✅ ANALYSE IA TERMINÉE - Document ID: {}", event.getDocumentId());
                                log.info("   📊 Réponse JSON reçue (longueur: {} caractères)", response.length());
                            })
                            .map(aiJsonResponse -> Tuples.of(aiJsonResponse, detectedLanguage)); // Tuple<String, String>
                })
                // 5. Parser la réponse JSON de l'IA
                .map(jsonAndLangTuple -> {
                    String aiJsonResponse = jsonAndLangTuple.getT1();
                    String detectedLanguage = jsonAndLangTuple.getT2();
                    CvParsedEventDto parsedDto = jsonParserUtil.safeParseCvJson(aiJsonResponse);
                    return Tuples.of(parsedDto, detectedLanguage); // Tuple<CvParsedEventDto, String>
                })
                // 6. Enrichir le DTO et publier l'événement de succès
                .flatMap(dtoAndLangTuple -> {
                    CvParsedEventDto parsedData = dtoAndLangTuple.getT1();
                    String detectedLanguage = dtoAndLangTuple.getT2();

                    // Enrichir avec les informations de l'événement original et métadonnées
                    parsedData.setKeycloakId(event.getKeycloakId());
                    parsedData.setDocumentId(event.getDocumentId());
                    parsedData.setCvLanguage(detectedLanguage); // Langue détectée par Tika

                    if (parsedData.getAiMetadata() == null) {
                        parsedData.setAiMetadata(CvParsedEventDto.AiProcessingMetadata.builder().build());
                    }
                    parsedData.getAiMetadata().setDocumentId(String.valueOf(event.getDocumentId()));
                    parsedData.getAiMetadata().setProcessedAt(LocalDateTime.now());
                    parsedData.getAiMetadata().setDetectedLanguage(detectedLanguage);
                    parsedData.getAiMetadata().setModelUsed(togetherAiConfig.getModel()); // Ajouter le modèle utilisé

                    // === AFFICHAGE DÉTAILLÉ DU RÉSULTAT DE L'ANALYSE ATS ===
                    log.info("=== RÉSULTAT COMPLET DE L'ANALYSE ATS pour documentId: {} ===", event.getDocumentId());

                    // Informations personnelles (sans données sensibles)
                    if (parsedData.getPersonalInfo() != null) {
                        log.info("👤 INFORMATIONS PERSONNELLES:");
                        log.info("   - Prénom: {}", parsedData.getPersonalInfo().getFirstName());
                        log.info("   - Nom: {}", parsedData.getPersonalInfo().getLastName());
                    }

                    // Analyse ATS complète
                    if (parsedData.getAtsAnalysis() != null) {
                        var ats = parsedData.getAtsAnalysis();
                        log.info("🎯 ANALYSE ATS COMPLÈTE:");
                        log.info("   📊 Score global: {}/100", ats.getOverallScore());
                        log.info("   📝 Évaluation générale: {}", ats.getOverallAssessment());
                        log.info("   🔧 Compatibilité ATS: {}", ats.getAtsCompatibility());
                        log.info("   ⚡ Priorité d'amélioration: {}", ats.getImprovementPriority());

                        // Détail des scores
                        if (ats.getScoreBreakdown() != null) {
                            var scores = ats.getScoreBreakdown();
                            log.info("   📈 DÉTAIL DES SCORES:");
                            log.info("      - Format: {}/100", scores.getFormatScore());
                            log.info("      - Contenu: {}/100", scores.getContentScore());
                            log.info("      - Compétences: {}/100", scores.getSkillsScore());
                            log.info("      - Expérience: {}/100", scores.getExperienceScore());
                            if (scores.getScoreExplanation() != null) {
                                log.info("      - Explication: {}", scores.getScoreExplanation());
                            }
                        }

                        // Points forts
                        if (ats.getStrengths() != null && !ats.getStrengths().isEmpty()) {
                            log.info("   ✅ POINTS FORTS ({} identifiés):", ats.getStrengths().size());
                            ats.getStrengths().forEach(strength -> log.info("      • {}", strength));
                        }

                        // Points faibles
                        if (ats.getWeaknesses() != null && !ats.getWeaknesses().isEmpty()) {
                            log.info("   ⚠️ POINTS FAIBLES ({} identifiés):", ats.getWeaknesses().size());
                            ats.getWeaknesses().forEach(weakness -> log.info("      • {}", weakness));
                        }

                        // Recommandations
                        if (ats.getRecommendations() != null && !ats.getRecommendations().isEmpty()) {
                            log.info("   💡 RECOMMANDATIONS ({} suggestions):", ats.getRecommendations().size());
                            ats.getRecommendations().forEach(recommendation -> log.info("      • {}", recommendation));
                        }

                        // Mots-clés manquants
                        if (ats.getMissingKeywords() != null && !ats.getMissingKeywords().isEmpty()) {
                            log.info("   🔍 MOTS-CLÉS MANQUANTS ({} suggérés):", ats.getMissingKeywords().size());
                            ats.getMissingKeywords().forEach(keyword -> log.info("      • {}", keyword));
                        }
                    }

                    // Métadonnées de traitement
                    if (parsedData.getAiMetadata() != null) {
                        log.info("🤖 MÉTADONNÉES IA:");
                        log.info("   - Modèle utilisé: {}", parsedData.getAiMetadata().getModelUsed());
                        log.info("   - Langue détectée: {}", parsedData.getAiMetadata().getDetectedLanguage());
                        log.info("   - Traité le: {}", parsedData.getAiMetadata().getProcessedAt());
                    }

                    log.info("=== FIN DU RÉSULTAT D'ANALYSE ATS ===");


                    log.info("CV processing successful for documentId: {}. Publishing CV_PARSED event.", event.getDocumentId());
                    Message<CvParsedEventDto> message = MessageBuilder.withPayload(parsedData).build();

                    // Tenter d'envoyer le message
                    boolean sent = streamBridge.send(CV_PARSED_BINDING, message);
                    if (!sent) {
                        log.error("Failed to publish CV_PARSED event for documentId: {} (StreamBridge returned false).", event.getDocumentId());
                        // Propager une erreur pour déclencher retry/DLQ
                        return Mono.error(new RuntimeException("Failed to publish CV_PARSED event for documentId: " + event.getDocumentId()));
                    }
                    long duration = System.currentTimeMillis() - startTime;
                    log.info("Processing pipeline completed successfully for documentId: {} in {} ms.", event.getDocumentId(), duration);
                    return Mono.empty(); // Indiquer le succès de cette étape
                })
                // Le .doOnError et .onErrorResume sont gérés dans RabbitMQStreamConfig pour la publication d'erreur
                // et pour laisser Spring Cloud Stream gérer les retries/DLQ.
                .then(); // Retourne Mono<Void>
    }

    /**
     * CORRECTION: Télécharge le PDF depuis le document-service et le retourne en Mono<byte[]>.
     * Gère les erreurs HTTP et les timeouts.
     *
     * @param documentId L'ID du document à télécharger.
     * @return Un Mono contenant le tableau d'octets du PDF, ou une erreur.
     */
    private Mono<byte[]> downloadPdfAsBytes(Long documentId) {
        String downloadUri = "/{id}/download"; // Utiliser la variable de config ?
        log.info("🔽 DÉBUT TÉLÉCHARGEMENT - Document ID: {}", documentId);
        log.info("   📡 URL de téléchargement: {}", downloadUri);
        log.info("   🌐 Service cible: document-management-service");

        return documentServiceWebClient.get()
                .uri(downloadUri, documentId)
                .retrieve()
                // Gestion spécifique des erreurs HTTP
                .onStatus(HttpStatusCode::is4xxClientError, clientResponse ->
                        clientResponse.bodyToMono(String.class).defaultIfEmpty("[No error body]")
                                .flatMap(errorBody -> {
                                    log.error("Client error downloading document {}: Status={}, Body={}", documentId, clientResponse.statusCode(), errorBody);
                                    if (clientResponse.statusCode() == HttpStatus.NOT_FOUND) {
                                        return Mono.error(new DocumentFetchException("Document " + documentId + " not found in document-service."));
                                    }
                                    return Mono.error(new DocumentFetchException("Client error fetching document " + documentId + ": " + clientResponse.statusCode()));
                                })
                )
                .onStatus(HttpStatusCode::is5xxServerError, clientResponse ->
                        clientResponse.bodyToMono(String.class).defaultIfEmpty("[No error body]")
                                .flatMap(errorBody -> {
                                    log.error("Server error downloading document {}: Status={}, Body={}", documentId, clientResponse.statusCode(), errorBody);
                                    return Mono.error(new DocumentFetchException("Server error at document-service for document " + documentId + ": " + clientResponse.statusCode()));
                                })
                )
                // Récupérer le corps comme Flux<DataBuffer> et joindre en byte[]
                .bodyToFlux(DataBuffer.class)
                .map(DataBuffer::asByteBuffer) // Convertir en ByteBuffer
                .collectList() // Collecter tous les ByteBuffers
                .map(list -> { // Concaténer les ByteBuffers en un seul byte[]
                    int totalSize = list.stream().mapToInt(ByteBuffer::remaining).sum();
                    ByteBuffer combined = ByteBuffer.allocate(totalSize);
                    list.forEach(combined::put);
                    return combined.array();
                })
                .doOnSuccess(bytes -> {
                    log.info("✅ TÉLÉCHARGEMENT RÉUSSI - Document ID: {}", documentId);
                    log.info("   📦 Taille du fichier: {} bytes ({} KB)", bytes.length, bytes.length / 1024);
                    log.info("   🔍 Type de contenu: PDF");
                    log.info("   ⏱️ Prêt pour l'extraction de texte");
                })
                // Gérer le cas où le corps est vide (succès HTTP mais pas de contenu)
                .filter(bytes -> bytes.length > 0)
                .switchIfEmpty(Mono.error(new DocumentFetchException("Document " + documentId + " downloaded with empty content.")))
                // Ajouter un timeout global pour l'opération de téléchargement
                // Le timeout est déjà configuré sur le WebClient, mais on peut en ajouter un spécifique ici si besoin
                // .timeout(Duration.ofSeconds(30))
                // Mapper les autres erreurs potentielles (ex: timeout, connexion)
                .onErrorMap(e -> !(e instanceof DocumentFetchException || e instanceof WebClientResponseException),
                        e -> new DocumentFetchException("Network or unexpected error during document download for id " + documentId, e));
    }
}