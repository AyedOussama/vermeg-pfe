package com.pfe2025.ai_processing_service.util;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature; // Import pour la configuration
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe2025.ai_processing_service.dto.CvParsedEventDto;
import com.pfe2025.ai_processing_service.exception.JsonParsingException;
import jakarta.annotation.PostConstruct; // Utiliser jakarta
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class JsonParserUtil {

    private final ObjectMapper objectMapper; // Injecter l'ObjectMapper configuré par Spring

    @PostConstruct
    public void configureObjectMapper() {
        // S'assurer que l'ObjectMapper ignore les propriétés inconnues
        // Peut aussi être configuré globalement dans une classe de configuration Jackson
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    /**
     * Tente de parser la chaîne JSON retournée par l'IA en objet CvParsedEventDto.
     * Inclut un nettoyage basique de la chaîne et une gestion d'erreur robuste.
     *
     * @param jsonString La chaîne JSON brute retournée par l'IA.
     * @return Un objet CvParsedEventDto peuplé.
     * @throws JsonParsingException si le parsing échoue ou si le JSON est vide/invalide.
     */
    public CvParsedEventDto safeParseCvJson(String jsonString) {
        if (jsonString == null || jsonString.isBlank()) {
            log.error("Attempting to parse null or blank JSON string from AI.");
            throw new JsonParsingException("AI response JSON is empty or null.");
        }

        String cleanedJson = cleanJsonString(jsonString);
        if (cleanedJson.isBlank()) {
            log.error("JSON string became blank after cleaning. Original: {}", jsonString);
            throw new JsonParsingException("AI response JSON became blank after cleaning.");
        }

        try {
            // Désérialiser. FAIL_ON_UNKNOWN_PROPERTIES est (normalement) déjà à false.
            CvParsedEventDto parsedDto = objectMapper.readValue(cleanedJson, CvParsedEventDto.class);

            // Validation spécifique pour l'analyse ATS
            validateAtsAnalysis(parsedDto);

            log.info("Successfully parsed AI JSON response into CvParsedEventDto with ATS analysis.");
            return parsedDto;

        } catch (JsonProcessingException e) {
            log.error("Failed to parse AI JSON response: {}", e.getMessage());
            // Logguer seulement une partie du JSON pour éviter de remplir les logs
            log.debug("Problematic JSON snippet (cleaned): {}", cleanedJson.substring(0, Math.min(cleanedJson.length(), 500)));
            throw new JsonParsingException("Cannot parse AI JSON response. Check logs for details.", e);
        } catch (Exception e) { // Attraper d'autres erreurs potentielles
            log.error("Unexpected error during JSON parsing: {}", e.getMessage(), e);
            throw new JsonParsingException("Unexpected error during JSON parsing.", e);
        }
    }

    /**
     * Nettoie la chaîne JSON potentiellement entourée de ```json ... ``` ou autre texte.
     * Rend la méthode plus robuste.
     */
    private String cleanJsonString(String rawResponse) {
        String cleaned = rawResponse.trim();

        // Enlever les marqueurs de bloc de code courants
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        // Enlever les marqueurs de fin aussi
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }

        cleaned = cleaned.trim(); // Re-trim après suppression des marqueurs

        // Trouver la première accolade ouvrante '{' et la dernière accolade fermante '}'
        // pour extraire l'objet JSON principal si du texte subsiste autour.
        int firstBrace = cleaned.indexOf('{');
        int lastBrace = cleaned.lastIndexOf('}');

        if (firstBrace == 0 && lastBrace == cleaned.length() - 1) {
            // Commence par { et finit par }, semble être du JSON propre.
            return cleaned;
        } else if (firstBrace != -1 && lastBrace > firstBrace) {
            // Il y a peut-être du texte avant/après, extraire l'objet JSON potentiel
            log.warn("Potential extraneous text found around JSON object, extracting content between first '{{' and last '}}'. Original length: {}, Extracted length: {}", cleaned.length(), (lastBrace + 1 - firstBrace));
            return cleaned.substring(firstBrace, lastBrace + 1).trim();
        } else {
            // Si on ne trouve pas d'accolades claires ou si elles sont mal placées,
            // retourner la chaîne nettoyée en espérant qu'elle soit valide.
            log.warn("Could not clearly identify JSON object boundaries ({{...}}). Attempting to parse the cleaned string directly. String starts with: '{}'", cleaned.substring(0, Math.min(cleaned.length(), 50)));
            return cleaned;
        }
    }

    /**
     * Valide que l'analyse ATS a été correctement parsée et contient les informations essentielles.
     *
     * @param parsedDto Le DTO parsé à valider
     */
    private void validateAtsAnalysis(CvParsedEventDto parsedDto) {
        if (parsedDto.getAtsAnalysis() == null) {
            log.warn("ATS analysis is missing from parsed CV data. This may indicate an issue with AI response format.");
            return;
        }

        CvParsedEventDto.AtsAnalysis atsAnalysis = parsedDto.getAtsAnalysis();

        // Validation des champs critiques
        if (atsAnalysis.getOverallScore() == null || atsAnalysis.getOverallScore() < 0 || atsAnalysis.getOverallScore() > 100) {
            log.warn("Invalid or missing overall score in ATS analysis: {}", atsAnalysis.getOverallScore());
        }

        if (atsAnalysis.getScoreBreakdown() == null) {
            log.warn("Score breakdown is missing from ATS analysis.");
        } else {
            CvParsedEventDto.ScoreBreakdown breakdown = atsAnalysis.getScoreBreakdown();
            if (breakdown.getFormatScore() == null || breakdown.getContentScore() == null ||
                    breakdown.getSkillsScore() == null || breakdown.getExperienceScore() == null) {
                log.warn("Some score breakdown components are missing.");
            }
        }

        if (atsAnalysis.getAtsCompatibility() == null || atsAnalysis.getAtsCompatibility().isBlank()) {
            log.warn("ATS compatibility assessment is missing.");
        }

        log.debug("ATS analysis validation completed. Overall score: {}, Compatibility: {}",
                atsAnalysis.getOverallScore(), atsAnalysis.getAtsCompatibility());
    }
}