package com.pfe2025.jobpostingservice.integration;



import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import com.pfe2025.jobpostingservice.exception.AIServiceException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * Client pour l'API d'IA Together.ai qui fournit des fonctionnalités d'assistance à la rédaction.
 */
@Component
@Slf4j
public class TogetherAIClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String model;
    private final boolean enabled;

    /**
     * Constructeur avec injection des dépendances et de la configuration.
     *
     * @param webClient Client web configuré pour les appels à l'API Together.ai
     * @param objectMapper Mapper JSON
     * @param model Modèle d'IA à utiliser
     * @param enabled Flag indiquant si le service d'IA est activé
     */
    public TogetherAIClient(WebClient togetherAiWebClient,
                            ObjectMapper objectMapper,
                            @Value("${app.ai.model}") String model,
                            @Value("${app.ai.enabled:true}") boolean enabled) {
        this.webClient = togetherAiWebClient;
        this.objectMapper = objectMapper;
        this.model = model;
        this.enabled = enabled;
        log.info("TogetherAI client initialized with model: {}, enabled: {}", model, enabled);
    }

    /**
     * Améliore une description d'offre d'emploi en la rendant plus attractive et professionnelle.
     *
     * @param originalDescription La description originale à améliorer
     * @return La description améliorée
     * @throws AIServiceException si l'appel au service d'IA échoue
     */
    @CircuitBreaker(name = "togetherAiClient", fallbackMethod = "improvementFallback")
    @Retry(name = "togetherAiClient")
    @RateLimiter(name = "togetherAiClient")
    public String improveJobDescription(String originalDescription) {
        if (!enabled) {
            log.warn("AI service is disabled. Returning original content.");
            return originalDescription;
        }

        log.debug("Requesting job description improvement from Together.ai");
        try {
            String prompt = createPromptForDescriptionImprovement(originalDescription);
            JsonNode response = callTogetherApi(prompt);

            String improvedDescription = extractResponseContent(response);
            log.info("Successfully improved job description");

            return improvedDescription;
        } catch (WebClientResponseException e) {
            log.error("Error calling Together.ai API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new AIServiceException("Erreur lors de l'appel à l'API d'IA: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error with Together.ai API", e);
            throw new AIServiceException("Erreur inattendue avec le service d'IA: " + e.getMessage(), e);
        }
    }

    /**
     * Suggère des compétences pertinentes en fonction d'une description de poste.
     *
     * @param jobDescription La description du poste
     * @param jobTitle Le titre du poste
     * @return Un tableau de compétences suggérées
     * @throws AIServiceException si l'appel au service d'IA échoue
     */
    @CircuitBreaker(name = "togetherAiClient", fallbackMethod = "suggestSkillsFallback")
    @Retry(name = "togetherAiClient")
    @RateLimiter(name = "togetherAiClient")
    public String[] suggestSkills(String jobDescription, String jobTitle) {
        if (!enabled) {
            log.warn("AI service is disabled. Returning empty skills array.");
            return new String[0];
        }

        log.debug("Requesting skill suggestions from Together.ai for job title: {}", jobTitle);
        try {
            String prompt = createPromptForSkillSuggestions(jobDescription, jobTitle);
            JsonNode response = callTogetherApi(prompt);

            String skillsText = extractResponseContent(response);
            String[] skills = parseSkillsResponse(skillsText);

            log.info("Successfully received {} skill suggestions", skills.length);
            return skills;
        } catch (WebClientResponseException e) {
            log.error("Error calling Together.ai API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new AIServiceException("Erreur lors de l'appel à l'API d'IA: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error with Together.ai API", e);
            throw new AIServiceException("Erreur inattendue avec le service d'IA: " + e.getMessage(), e);
        }
    }

    /**
     * Optimise le titre d'une offre d'emploi pour le rendre plus attractif.
     *
     * @param originalTitle Le titre original à optimiser
     * @param jobDescription La description du poste pour contexte
     * @return Le titre optimisé
     * @throws AIServiceException si l'appel au service d'IA échoue
     */
    @CircuitBreaker(name = "togetherAiClient", fallbackMethod = "optimizeTitleFallback")
    @Retry(name = "togetherAiClient")
    @RateLimiter(name = "togetherAiClient")
    public String optimizeJobTitle(String originalTitle, String jobDescription) {
        if (!enabled) {
            log.warn("AI service is disabled. Returning original title.");
            return originalTitle;
        }

        log.debug("Requesting job title optimization from Together.ai for: {}", originalTitle);
        try {
            String prompt = createPromptForTitleOptimization(originalTitle, jobDescription);
            JsonNode response = callTogetherApi(prompt);

            String optimizedTitle = extractResponseContent(response).trim();
            log.info("Successfully optimized job title to: {}", optimizedTitle);

            return optimizedTitle;
        } catch (WebClientResponseException e) {
            log.error("Error calling Together.ai API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new AIServiceException("Erreur lors de l'appel à l'API d'IA: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error with Together.ai API", e);
            throw new AIServiceException("Erreur inattendue avec le service d'IA: " + e.getMessage(), e);
        }
    }

    /**
     * Méthode de fallback pour l'amélioration de description en cas d'erreur.
     */
    private String improvementFallback(String originalDescription, Throwable t) {
        log.warn("Fallback for description improvement invoked due to: {}", t.getMessage());
        return originalDescription;
    }

    /**
     * Méthode de fallback pour la suggestion de compétences en cas d'erreur.
     */
    private String[] suggestSkillsFallback(String jobDescription, String jobTitle, Throwable t) {
        log.warn("Fallback for skill suggestions invoked due to: {}", t.getMessage());
        return new String[0];
    }

    /**
     * Méthode de fallback pour l'optimisation de titre en cas d'erreur.
     */
    private String optimizeTitleFallback(String originalTitle, String jobDescription, Throwable t) {
        log.warn("Fallback for title optimization invoked due to: {}", t.getMessage());
        return originalTitle;
    }

    /**
     * Crée le prompt pour l'amélioration de description.
     */
    private String createPromptForDescriptionImprovement(String originalDescription) {
        return "Tu es un expert en rédaction d'offres d'emploi. " +
                "Améliore la description suivante en la rendant plus attractive, " +
                "professionnelle et en mettant en avant les aspects motivants du poste. " +
                "Garde le même ton général et les mêmes informations, " +
                "mais optimise la structure et la formulation pour attirer les meilleurs candidats. " +
                "Voici la description originale:\n\n" + originalDescription;
    }

    /**
     * Crée le prompt pour la suggestion de compétences.
     */
    private String createPromptForSkillSuggestions(String jobDescription, String jobTitle) {
        return "Tu es un expert en recrutement. " +
                "En fonction du titre de poste et de la description suivante, " +
                "suggère une liste de 5 à 10 compétences techniques et non-techniques pertinentes " +
                "pour ce poste. Retourne uniquement les compétences sous forme de liste, " +
                "sans autre texte. Chaque compétence doit être sur une nouvelle ligne.\n\n" +
                "Titre du poste: " + jobTitle + "\n\n" +
                "Description: " + jobDescription;
    }

    /**
     * Crée le prompt pour l'optimisation de titre.
     */
    private String createPromptForTitleOptimization(String originalTitle, String jobDescription) {
        return "Tu es un expert en recrutement. " +
                "Optimise le titre de poste suivant pour le rendre plus attractif " +
                "et précis tout en restant professionnel. " +
                "Le titre doit être concis (maximum 6 mots) et refléter précisément le poste. " +
                "Retourne uniquement le nouveau titre, sans autre texte.\n\n" +
                "Titre original: " + originalTitle + "\n\n" +
                "Description du poste pour contexte: " + jobDescription;
    }

    /**
     * Effectue l'appel à l'API Together.ai.
     */
    private JsonNode callTogetherApi(String prompt) {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", model);

        ArrayNode messagesArray = requestBody.putArray("messages");
        ObjectNode userMessage = messagesArray.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);

        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 1000);

        log.debug("Calling Together.ai API with prompt length: {}", prompt.length());

        return webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(java.time.Duration.ofSeconds(30))
                .onErrorResume(TimeoutException.class, e -> {
                    log.error("Timeout calling Together.ai API", e);
                    return Mono.error(new AIServiceException("Délai d'attente dépassé lors de l'appel à l'API d'IA", e));
                })
                .block();
    }

    /**
     * Extrait le contenu de la réponse de l'API.
     */
    private String extractResponseContent(JsonNode response) {
        try {
            return response.path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText();
        } catch (Exception e) {
            log.error("Error extracting content from API response: {}", response, e);
            throw new AIServiceException("Erreur lors de l'extraction du contenu de la réponse de l'API", e);
        }
    }

    /**
     * Parse la réponse de compétences en tableau.
     */
    private String[] parseSkillsResponse(String skillsText) {
        return skillsText.lines()
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .map(line -> line.replaceAll("^[-*•] ", "")) // Supprime les puces éventuelles
                .toArray(String[]::new);
    }
}
