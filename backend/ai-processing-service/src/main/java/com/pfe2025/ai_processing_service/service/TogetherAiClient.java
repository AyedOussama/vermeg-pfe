package com.pfe2025.ai_processing_service.service;

import com.pfe2025.ai_processing_service.config.TogetherAiConfig;
import com.pfe2025.ai_processing_service.dto.TogetherAiRequest;
import com.pfe2025.ai_processing_service.dto.TogetherAiResponse;
import com.pfe2025.ai_processing_service.exception.AiApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;

@Service
@Slf4j
// CORRECTION: Suppression de @RequiredArgsConstructor
public class TogetherAiClient {

    private final WebClient webClient;
    private final TogetherAiConfig config;

    // CORRECTION: Ajout du constructeur explicite avec @Qualifier sur le paramètre
    public TogetherAiClient(@Qualifier("togetherAiWebClient") WebClient webClient,
                            TogetherAiConfig config) {
        this.webClient = webClient;
        this.config = config;
    }


    // Prompt système amélioré pour l'analyse ATS
    private static final String SYSTEM_PROMPT = """
            You are an expert ATS (Applicant Tracking System) and HR specialist with deep expertise in CV analysis and recruitment.
            Your role is to:
            1. Extract structured information from CVs while protecting personal data privacy
            2. Provide comprehensive ATS-style analysis with scoring and recommendations
            3. Act as a professional recruitment consultant offering actionable insights

            IMPORTANT PRIVACY REQUIREMENTS:
            - DO NOT extract or include personal contact information (email, phone, address)
            - Only extract first name and last name for identification purposes
            - Focus on professional qualifications, skills, and experience

            ANALYSIS REQUIREMENTS:
            - Provide an overall score out of 100 based on professional criteria
            - Identify strengths and weaknesses with specific examples
            - Offer concrete recommendations for improvement
            - Assess ATS compatibility and suggest missing keywords
            - Break down scoring by categories (format, content, skills, experience)

            Adhere strictly to the requested JSON format and field names.
            If information for a field is not found, use null for strings/objects, 0 for numbers, and empty arrays [] for lists.
            Ensure the final output is ONLY the JSON object, without any introductory text, explanations, or markdown formatting.
            {language_instruction}
            Respond ONLY with the JSON object.
            """;

    // Prompt utilisateur amélioré pour l'analyse ATS complète
    private static final String USER_PROMPT_TEMPLATE = """
            Analyze the following CV content as an expert ATS system and provide comprehensive analysis in the specified JSON format:

            CV Content:
            \"\"\"
            {cv_text}
            \"\"\"

            Requested JSON Structure (IMPORTANT - Follow exactly):
            {
              "personalInfo": {"firstName": "...", "lastName": "..."},
              "skills": ["...", "..."],
              "experiences": [{"company": "...", "position": "...", "startDate": "...", "endDate": "...", "description": "..."}],
              "educationHistory": [{"degree": "...", "institution": "...", "field": "...", "year": "..."}],
              "certifications": [{"name": "...", "issuer": "...", "date": "..."}],
              "languages": [{"language": "...", "proficiency": "..."}],
              "seniorityLevel": "...",
              "yearsOfExperience": ...,
              "profileSummary": "...",
              "cvLanguage": "...",
              "atsAnalysis": {
                "overallScore": ...,
                "overallAssessment": "...",
                "strengths": ["...", "..."],
                "weaknesses": ["...", "..."],
                "recommendations": ["...", "..."],
                "scoreBreakdown": {
                  "formatScore": ...,
                  "contentScore": ...,
                  "skillsScore": ...,
                  "experienceScore": ...,
                  "scoreExplanation": "..."
                },
                "atsCompatibility": "...",
                "missingKeywords": ["...", "..."],
                "improvementPriority": "..."
              }
            }

            SCORING GUIDELINES:
            - Overall Score (0-100): Comprehensive evaluation of the CV
            - Format Score (0-20): Structure, readability, ATS-friendliness
            - Content Score (0-30): Relevance, clarity, completeness
            - Skills Score (0-25): Technical and soft skills presentation
            - Experience Score (0-25): Professional experience quality and relevance
            - ATS Compatibility: EXCELLENT (90-100), GOOD (70-89), FAIR (50-69), POOR (0-49)
            - Improvement Priority: HIGH (score < 60), MEDIUM (60-79), LOW (80+)
            """;


    /**
     * Appelle l'API Together AI pour extraire les données structurées d'un texte de CV
     * et effectuer une analyse ATS complète avec scoring et recommandations.
     *
     * @param cvText Le texte brut du CV.
     * @param detectedLanguage La langue détectée (ex: "fr", "en") pour adapter le prompt.
     * @return Un Mono<String> contenant la réponse JSON brute de l'IA avec l'analyse ATS.
     */
    public Mono<String> extractCvDataFromText(String cvText, String detectedLanguage) {
        // Tronquer le texte si trop long pour éviter de dépasser les limites de tokens/coûts
        final int maxChars = 15000; // Ajustable
        String processedText = cvText.length() > maxChars ? cvText.substring(0, maxChars) + "\n[... TRUNCATED ...]" : cvText;

        // Adapter l'instruction de langue dans le prompt système
        String languageInstruction = "";
        if (StringUtils.hasText(detectedLanguage)) {
            if ("fr".equalsIgnoreCase(detectedLanguage)) {
                languageInstruction = "\nIMPORTANT: Generate all text fields (descriptions, summary, ATS analysis, recommendations) in French.";
            } else if ("en".equalsIgnoreCase(detectedLanguage)) {
                languageInstruction = "\nIMPORTANT: Generate all text fields (descriptions, summary, ATS analysis, recommendations) in English.";
            }
            // Ajouter d'autres langues si nécessaire
        } else {
            log.warn("No detected language provided to AI. AI will use its default language/inference.");
        }

        String systemPrompt = SYSTEM_PROMPT.replace("{language_instruction}", languageInstruction);
        String userPrompt = USER_PROMPT_TEMPLATE.replace("{cv_text}", processedText);

        // Construire la requête
        TogetherAiRequest requestPayload = TogetherAiRequest.builder()
                .model(config.getModel())
                .messages(List.of(
                        TogetherAiRequest.Message.builder().role("system").content(systemPrompt).build(),
                        TogetherAiRequest.Message.builder().role("user").content(userPrompt).build()
                ))
                .max_tokens(4096) // Augmenté pour accommoder l'analyse ATS complète
                .temperature(0.3) // Température légèrement augmentée pour des analyses plus créatives
                // Optionnel: Forcer le format JSON si le modèle le supporte
                // .response_format(TogetherAiRequest.ResponseFormat.builder().type("json_object").build())
                .build();

        log.info("Calling Together AI API (model: {}) to extract data. Language hint: {}", config.getModel(), detectedLanguage != null ? detectedLanguage : "none");

        return webClient.post()
                .uri(config.getChatEndpoint())
                .bodyValue(requestPayload)
                .retrieve()
                // Gestion améliorée des erreurs HTTP
                .onStatus(HttpStatusCode::isError, clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .defaultIfEmpty("[No error body]")
                                .flatMap(errorBody -> {
                                    log.error("Together AI API error: Status={}, Body={}", clientResponse.statusCode(), errorBody);
                                    String message = "Error from Together AI API: " + clientResponse.statusCode();
                                    // Tenter de parser l'erreur si possible
                                    // try {
                                    //    ApiError apiError = objectMapper.readValue(errorBody, ApiError.class);
                                    //    message += " - " + apiError.getMessage();
                                    // } catch (Exception ignored) {}
                                    return Mono.error(new AiApiException(message, new WebClientResponseException(
                                            clientResponse.statusCode().value(),
                                            "Error from AI API",
                                            clientResponse.headers().asHttpHeaders(),
                                            errorBody.getBytes(),
                                            null)));
                                })
                )
                .bodyToMono(TogetherAiResponse.class)
                // Extraire le contenu de la réponse
                .flatMap(response -> {
                    if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
                        TogetherAiResponse.Message message = response.getChoices().get(0).getMessage();
                        if (message != null && message.getContent() != null) {
                            log.info("Successfully received response from Together AI. Finish reason: {}", response.getChoices().get(0).getFinish_reason());
                            log.debug("AI Raw Response Content length: {}", message.getContent().length());
                            return Mono.just(message.getContent());
                        }
                    }
                    log.error("Received empty or invalid response structure from Together AI: {}", response);
                    return Mono.error(new AiApiException("Received empty or invalid response structure from Together AI."));
                })
                // Stratégie de retry améliorée
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(3)) // Augmenter le délai initial
                        .filter(throwable -> throwable instanceof AiApiException || throwable instanceof WebClientResponseException || throwable instanceof java.io.IOException) // Retenter sur erreurs API/réseau
                        .doBeforeRetry(retrySignal -> log.warn("Retrying Together AI call (attempt #{}): {}", retrySignal.totalRetries() + 1, retrySignal.failure().getMessage()))
                        .onRetryExhaustedThrow((retryBackoffSpec, retrySignal) ->
                                new AiApiException("Failed to call Together AI API after " + retrySignal.totalRetries() + " retries.", retrySignal.failure())
                        )
                );
        // Le timeout global est géré par la configuration du WebClient.
    }
}