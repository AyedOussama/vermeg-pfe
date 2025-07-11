package com.pfe2025.jobpostingservice.controller;



import com.pfe2025.jobpostingservice.dto.AIAssistanceDTO;
import com.pfe2025.jobpostingservice.dto.JobPostingSkillDTO;
import com.pfe2025.jobpostingservice.service.AIAssistanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

/**
 * Contrôleur REST pour les fonctionnalités d'assistance IA.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Assistance IA", description = "Opérations d'assistance à la rédaction basées sur l'IA")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('RH_ADMIN')")
public class AIAssistanceController {

    private final AIAssistanceService aiAssistanceService;

    @PostMapping("/improve")
    @Operation(summary = "Améliorer du contenu", description = "Améliore un contenu textuel pour une offre d'emploi")
    @ApiResponse(responseCode = "200", description = "Contenu amélioré avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "503", description = "Service d'IA non disponible")
    public ResponseEntity<AIAssistanceDTO.Response> improveContent(@Valid @RequestBody AIAssistanceDTO.Request request) {
        log.info("REST request to improve content with type: {}", request.getImprovementType());
        AIAssistanceDTO.Response response = aiAssistanceService.improveContent(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/suggest-skills")
    @Operation(summary = "Suggérer des compétences", description = "Suggère des compétences pertinentes pour un poste")
    @ApiResponse(responseCode = "200", description = "Compétences suggérées avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "503", description = "Service d'IA non disponible")
    public ResponseEntity<Set<JobPostingSkillDTO>> suggestSkills(
            @RequestParam String jobTitle,
            @RequestParam String jobDescription) {
        log.info("REST request to suggest skills for job title: {}", jobTitle);
        Set<JobPostingSkillDTO> suggestedSkills = aiAssistanceService.suggestSkills(jobTitle, jobDescription);
        return ResponseEntity.ok(suggestedSkills);
    }

    @PostMapping("/improve-job-post")
    @Operation(summary = "Améliorer une offre complète", description = "Améliore plusieurs aspects d'une offre d'emploi simultanément")
    @ApiResponse(responseCode = "202", description = "Amélioration lancée avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "503", description = "Service d'IA non disponible")
    public ResponseEntity<Map<String, String>> improveJobPostAsync(
            @RequestParam String title,
            @RequestParam String description) {
        log.info("REST request to asynchronously improve job post with title: {}", title);

        // Lancer l'amélioration en arrière-plan
        CompletableFuture<AIAssistanceService.AIImprovementResult> future =
                aiAssistanceService.improveJobPostAsync(title, description);

        // Retourner immédiatement avec un message indiquant que le traitement est en cours
        return ResponseEntity.accepted()
                .body(Map.of("message", "Amélioration en cours. Utilisez un webhook ou une requête ultérieure pour récupérer les résultats."));
    }
}
