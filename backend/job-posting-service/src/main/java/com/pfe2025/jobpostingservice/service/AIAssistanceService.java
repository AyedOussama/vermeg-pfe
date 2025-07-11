package com.pfe2025.jobpostingservice.service;


import com.pfe2025.jobpostingservice.dto.AIAssistanceDTO;
import com.pfe2025.jobpostingservice.dto.JobPostingSkillDTO;
import com.pfe2025.jobpostingservice.exception.AIServiceException;
import com.pfe2025.jobpostingservice.exception.InvalidOperationException;
import com.pfe2025.jobpostingservice.integration.TogetherAIClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Service d'assistance à la rédaction basé sur l'IA.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIAssistanceService {

    private final TogetherAIClient aiClient;

    /**
     * Améliore le contenu textuel d'une offre d'emploi.
     *
     * @param request La requête d'amélioration
     * @return La réponse contenant le contenu amélioré
     */
    public AIAssistanceDTO.Response improveContent(AIAssistanceDTO.Request request) {
        log.debug("Improving content with type: {}", request.getImprovementType());

        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new InvalidOperationException("Le contenu à améliorer ne peut pas être vide");
        }

        try {
            String improvedContent;
            String suggestions = "";
            double improvementScore = 0.0;

            switch (request.getImprovementType()) {
                case "IMPROVE_DESCRIPTION":
                    improvedContent = aiClient.improveJobDescription(request.getContent());
                    improvementScore = calculateImprovementScore(request.getContent(), improvedContent);
                    suggestions = "La description a été améliorée pour mettre en avant les aspects attractifs du poste.";
                    break;
                case "OPTIMIZE_TITLE":
                    improvedContent = aiClient.optimizeJobTitle(request.getContent(), request.getContext());
                    improvementScore = calculateImprovementScore(request.getContent(), improvedContent);
                    suggestions = "Le titre a été optimisé pour être plus attractif et précis.";
                    break;
                default:
                    throw new InvalidOperationException("Type d'amélioration non supporté: " + request.getImprovementType());
            }

            return AIAssistanceDTO.Response.builder()
                    .originalContent(request.getContent())
                    .improvedContent(improvedContent)
                    .suggestions(suggestions)
                    .improvementScore(improvementScore)
                    .build();

        } catch (AIServiceException e) {
            log.error("Error improving content: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Suggère des compétences pertinentes pour un poste.
     *
     * @param jobTitle Le titre du poste
     * @param jobDescription La description du poste
     * @return Une liste de compétences suggérées
     */
    public Set<JobPostingSkillDTO> suggestSkills(String jobTitle, String jobDescription) {
        log.debug("Suggesting skills for job title: {}", jobTitle);

        try {
            String[] skills = aiClient.suggestSkills(jobDescription, jobTitle);

            return Arrays.stream(skills)
                    .map(skillName -> {
                        JobPostingSkillDTO skillDto = new JobPostingSkillDTO();
                        skillDto.setName(skillName);
                        skillDto.setIsRequired(true);
                        return skillDto;
                    })
                    .collect(Collectors.toSet());

        } catch (AIServiceException e) {
            log.error("Error suggesting skills: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Exécute plusieurs améliorations en parallèle.
     *
     * @param title Le titre à optimiser
     * @param description La description à améliorer
     * @return Un futur contenant les résultats
     */
    @Async("aiExecutor")
    public CompletableFuture<AIImprovementResult> improveJobPostAsync(String title, String description) {
        log.debug("Improving job post asynchronously");

        try {
            // Exécuter les améliorations en parallèle
            CompletableFuture<String> titleFuture = CompletableFuture.supplyAsync(() ->
                    aiClient.optimizeJobTitle(title, description));

            CompletableFuture<String> descriptionFuture = CompletableFuture.supplyAsync(() ->
                    aiClient.improveJobDescription(description));

            CompletableFuture<String[]> skillsFuture = CompletableFuture.supplyAsync(() ->
                    aiClient.suggestSkills(description, title));

            // Attendre que toutes les améliorations soient terminées
            CompletableFuture<Void> allFutures = CompletableFuture.allOf(
                    titleFuture, descriptionFuture, skillsFuture);

            // Construire le résultat final
            return allFutures.thenApply(v -> {
                String optimizedTitle = titleFuture.join();
                String improvedDescription = descriptionFuture.join();
                String[] suggestedSkills = skillsFuture.join();

                return new AIImprovementResult(
                        optimizedTitle,
                        improvedDescription,
                        Arrays.asList(suggestedSkills)
                );
            });

        } catch (Exception e) {
            log.error("Error in asynchronous job post improvement: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(
                    new AIServiceException("Erreur lors de l'amélioration asynchrone: " + e.getMessage(), e));
        }
    }

    /**
     * Calcule un score d'amélioration basé sur les différences entre le contenu original et amélioré.
     *
     * @param original Le contenu original
     * @param improved Le contenu amélioré
     * @return Un score entre 0 et 100
     */
    private double calculateImprovementScore(String original, String improved) {
        if (original.equals(improved)) {
            return 0.0;
        }

        // Calculer la différence de longueur
        double lengthDiff = Math.abs(improved.length() - original.length()) / (double) original.length();
        lengthDiff = Math.min(lengthDiff, 1.0); // Limiter à 100%

        // Calculer le nombre de mots différents
        Set<String> originalWords = Arrays.stream(original.toLowerCase().split("\\W+"))
                .filter(w -> w.length() > 3)
                .collect(Collectors.toSet());

        Set<String> improvedWords = Arrays.stream(improved.toLowerCase().split("\\W+"))
                .filter(w -> w.length() > 3)
                .collect(Collectors.toSet());

        // Calculer le nombre de nouveaux mots significatifs
        long newWords = improvedWords.stream()
                .filter(w -> !originalWords.contains(w))
                .count();

        double wordsDiff = (double) newWords / improvedWords.size();
        wordsDiff = Math.min(wordsDiff, 1.0); // Limiter à 100%

        // Calcul du score final (pondération arbitraire)
        return (wordsDiff * 0.7 + lengthDiff * 0.3) * 100.0;
    }

    /**
     * Classe interne pour regrouper les résultats d'amélioration.
     */
    public static class AIImprovementResult {
        private final String optimizedTitle;
        private final String improvedDescription;
        private final List<String> suggestedSkills;

        public AIImprovementResult(String optimizedTitle, String improvedDescription, List<String> suggestedSkills) {
            this.optimizedTitle = optimizedTitle;
            this.improvedDescription = improvedDescription;
            this.suggestedSkills = suggestedSkills;
        }

        public String getOptimizedTitle() {
            return optimizedTitle;
        }

        public String getImprovedDescription() {
            return improvedDescription;
        }

        public List<String> getSuggestedSkills() {
            return suggestedSkills;
        }
    }
}
