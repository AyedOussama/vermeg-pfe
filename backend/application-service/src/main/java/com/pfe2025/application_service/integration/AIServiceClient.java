package com.pfe2025.application_service.integration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe2025.application_service.config.ApplicationProperties;
import com.pfe2025.application_service.dto.CandidateProfileDTO;
import com.pfe2025.application_service.dto.EvaluationDTO;
import com.pfe2025.application_service.dto.JobPostingDTO;
import com.pfe2025.application_service.exception.AIEvaluationException;
import com.pfe2025.application_service.model.Evaluation.EvaluationRecommendation;
import com.pfe2025.application_service.util.AIPromptGenerator;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
@Slf4j
@CacheConfig(cacheNames = "aiEvaluations")
public class AIServiceClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final ApplicationProperties applicationProperties;
    private final AIPromptGenerator aiPromptGenerator;

    public AIServiceClient(@Qualifier("externalApiKeyWebClientBuilder") WebClient.Builder webClientBuilder,
                           ObjectMapper objectMapper,
                           ApplicationProperties applicationProperties,
                           AIPromptGenerator aiPromptGenerator) {
        this.applicationProperties = applicationProperties;
        this.webClient = webClientBuilder
                .baseUrl(applicationProperties.getIntegration().getAiService().getBaseUrl())
                .defaultHeader("Authorization", "Bearer " + applicationProperties.getAi().getEvaluation().getApiKey())
                .build();
        this.objectMapper = objectMapper;
        this.aiPromptGenerator = aiPromptGenerator;

        log.info("AIServiceClient initialized with URL: {}, Timeout: {}s",
                applicationProperties.getIntegration().getAiService().getBaseUrl(),
                applicationProperties.getIntegration().getAiService().getTimeoutSeconds());
    }

    @PostConstruct
    public void validateConfiguration() {
        if (applicationProperties.getAi().getEvaluation().getApiKey() == null ||
                applicationProperties.getAi().getEvaluation().getApiKey().trim().isEmpty()) {
            log.error("AI service API key (app.ai.evaluation.api-key) is not configured!");
        } else {
            log.info("AI service API key loaded successfully.");
        }

        if (applicationProperties.getAi().getEvaluation().getModel() == null ||
                applicationProperties.getAi().getEvaluation().getModel().trim().isEmpty()) {
            log.error("AI model (app.ai.evaluation.model) is not configured!");
        } else {
            log.info("AI model configured: {}", applicationProperties.getAi().getEvaluation().getModel());
        }
    }

    @CircuitBreaker(name = "aiServiceClient", fallbackMethod = "evaluateApplicationFallback")
    @Retry(name = "aiServiceClient")
    @Bulkhead(name = "aiServiceClient")
    @Cacheable(key = "'app-' + #applicationId + '-' + #candidateProfile.id + '-' + #jobPosting.id",
            unless = "#result == null")
    public Mono<EvaluationDTO> evaluateApplication(Long applicationId,
                                                   CandidateProfileDTO candidateProfile,
                                                   JobPostingDTO jobPosting) {
        Objects.requireNonNull(applicationId, "Application ID cannot be null");
        Objects.requireNonNull(candidateProfile, "Candidate profile cannot be null");
        Objects.requireNonNull(jobPosting, "Job posting cannot be null");

        // Generate a prompt using the complete objects
        String prompt = aiPromptGenerator.generateCompleteEvaluationPrompt(jobPosting, candidateProfile);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", applicationProperties.getAi().getEvaluation().getModel());
        requestBody.put("messages", new Object[]{message});
        requestBody.put("max_tokens", applicationProperties.getAi().getEvaluation().getMaxTokens());
        requestBody.put("temperature", applicationProperties.getAi().getEvaluation().getTemperature());
        requestBody.put("stream", applicationProperties.getAi().getEvaluation().isStream());

        log.debug("AI evaluation request for application [{}], model [{}], prompt length: {}",
                applicationId, applicationProperties.getAi().getEvaluation().getModel(), prompt.length());

        return webClient
                .post()
                .uri("/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    log.error("AI API error status: {}, body: {}",
                                            response.statusCode(), errorBody);
                                    return Mono.error(new AIEvaluationException(
                                            "AI API error: " + response.statusCode() + " - " + errorBody));
                                })
                )
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(applicationProperties.getIntegration().getAiService().getTimeoutSeconds()))
                .flatMap(this::parseEvaluationResponse)
                .doOnSuccess(result -> log.info("AI evaluation successful for application [{}]", applicationId))
                .doOnError(error -> log.error("Error during AI evaluation for application [{}]: {}",
                        applicationId, error.getMessage()))
                .onErrorMap(ex -> new AIEvaluationException(
                        "Error communicating with AI service: " + ex.getMessage(), ex));
    }

    private Mono<EvaluationDTO> parseEvaluationResponse(String responseJson) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseJson);
            if (rootNode.has("error")) {
                String errorMessage = rootNode.get("error").path("message").asText("Unknown AI API error");
                log.error("AI API error: {}", errorMessage);
                return Mono.error(new AIEvaluationException(errorMessage));
            }

            JsonNode choice = rootNode.path("choices").path(0);
            if (choice.isMissingNode()) {
                log.error("Malformed AI API response: 'choices' missing or empty. Response: {}", responseJson);
                return Mono.error(new AIEvaluationException("Malformed AI API response: 'choices' missing."));
            }

            String aiResponseContent = choice.path("message").path("content").asText();
            if (aiResponseContent.isEmpty()) {
                log.error("Empty AI response content. Raw response: {}", responseJson);
                return Mono.error(new AIEvaluationException("Empty AI response content."));
            }

            // Clean if the JSON response is sometimes surrounded by ```json ... ```
            String cleanedJsonResponse = aiResponseContent
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            try {
                JsonNode evaluationNode = objectMapper.readTree(cleanedJsonResponse);

                return Mono.just(EvaluationDTO.builder()
                        .overallScore(getDoubleValue(evaluationNode, "overallScore", 0.0))
                        .justification(getTextValue(evaluationNode, "justification", ""))
                        .technicalSkillScore(getDoubleValue(evaluationNode, "technicalSkillScore", 0.0))
                        .experienceScore(getDoubleValue(evaluationNode, "experienceScore", 0.0))
                        .educationScore(getDoubleValue(evaluationNode, "educationScore", 0.0))
                        .softSkillScore(getDoubleValue(evaluationNode, "softSkillScore", 0.0))
                        .categoryScores(extractCategoryScores(evaluationNode.path("categoryScores")))
                        .strengths(getTextValue(evaluationNode, "strengths", ""))
                        .weaknesses(getTextValue(evaluationNode, "weaknesses", ""))
                        .recommendation(EvaluationRecommendation.fromString(
                                getTextValue(evaluationNode, "recommendation", "REVIEW")))
                        .modelUsed(applicationProperties.getAi().getEvaluation().getModel())
                        .evaluatedAt(LocalDateTime.now())
                        .build());
            } catch (JsonProcessingException e) {
                log.error("Error parsing evaluation JSON from AI response: {}", e.getMessage());
                return Mono.error(new AIEvaluationException("Error parsing evaluation JSON from AI response", e));
            }
        } catch (JsonProcessingException e) {
            log.error("Error parsing AI response JSON: {}. Response: {}", e.getMessage(), responseJson);
            return Mono.error(new AIEvaluationException("Error parsing AI response.", e));
        }
    }

    private String getTextValue(JsonNode node, String fieldName, String defaultValue) {
        JsonNode field = node.get(fieldName);
        return (field != null && !field.isNull()) ? field.asText(defaultValue) : defaultValue;
    }

    private Double getDoubleValue(JsonNode node, String fieldName, Double defaultValue) {
        JsonNode field = node.get(fieldName);
        return (field != null && !field.isNull()) ? field.asDouble(defaultValue) : defaultValue;
    }

    private Map<String, Double> extractCategoryScores(JsonNode scoresNode) {
        Map<String, Double> categoryScores = new HashMap<>();
        if (scoresNode != null && scoresNode.isObject()) {
            scoresNode.fields().forEachRemaining(entry ->
                    categoryScores.put(entry.getKey(), entry.getValue().asDouble(0.0)));
        }
        return categoryScores;
    }

    public Mono<EvaluationDTO> evaluateApplicationFallback(Long applicationId,
                                                           CandidateProfileDTO candidateProfile,
                                                           JobPostingDTO jobPosting,
                                                           Throwable ex) {
        log.warn("Fallback for AI evaluation of application [{}]. Error: {}", applicationId, ex.getMessage());
        return Mono.just(EvaluationDTO.builder()
                .overallScore(0.0) // Neutral score indicating failure
                .justification("Automatic evaluation failed. Manual review required. Error: " + ex.getMessage())
                .recommendation(EvaluationRecommendation.REVIEW) // Force manual review
                .modelUsed("fallback")
                .evaluatedAt(LocalDateTime.now())
                .build());
    }
}