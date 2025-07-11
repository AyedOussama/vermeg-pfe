package com.pfe2025.jobpostingservice.controller;


import com.pfe2025.jobpostingservice.dto.MetricsDailySnapshotDTO;
import com.pfe2025.jobpostingservice.dto.PostingMetricsDTO;
import com.pfe2025.jobpostingservice.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des métriques des offres d'emploi.
 */
@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Métriques", description = "Opérations pour consulter les métriques des offres d'emploi")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('RH_ADMIN')")
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/job-post/{jobPostId}")
    @Operation(summary = "Obtenir les métriques d'une offre", description = "Récupère les métriques d'une offre d'emploi spécifique")
    @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Métriques non trouvées")
    public ResponseEntity<PostingMetricsDTO> getMetricsForJobPost(@PathVariable Long jobPostId) {
        log.info("REST request to get metrics for job post : {}", jobPostId);
        PostingMetricsDTO metrics = metricsService.getMetricsForJobPost(jobPostId);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/job-post/{jobPostId}/daily")
    @Operation(summary = "Obtenir les métriques quotidiennes", description = "Récupère les métriques quotidiennes d'une offre d'emploi")
    @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Métriques non trouvées")
    public ResponseEntity<List<MetricsDailySnapshotDTO>> getDailyMetricsForJobPost(
            @PathVariable Long jobPostId,
            @Parameter(description = "Nombre de jours à récupérer") @RequestParam(defaultValue = "30") int days) {
        log.info("REST request to get daily metrics for job post : {}, days: {}", jobPostId, days);
        List<MetricsDailySnapshotDTO> metrics = metricsService.getDailyMetricsForJobPost(jobPostId, days);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/departments")
    @Operation(summary = "Obtenir les métriques par département", description = "Récupère les métriques agrégées par département")
    @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<Map<String, Map<String, Object>>> getMetricsByDepartment() {
        log.info("REST request to get metrics by department");
        Map<String, Map<String, Object>> metrics = metricsService.getMetricsByDepartment();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/top/applications")
    @Operation(summary = "Top des offres par candidatures", description = "Récupère les offres avec le plus de candidatures")
    @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<List<PostingMetricsDTO>> getTopByApplications(
            @Parameter(description = "Nombre maximum de résultats") @RequestParam(defaultValue = "5") int limit) {
        log.info("REST request to get top job posts by applications, limit: {}", limit);
        List<PostingMetricsDTO> topMetrics = metricsService.getTopByApplications(limit);
        return ResponseEntity.ok(topMetrics);
    }

    @GetMapping("/top/conversion")
    @Operation(summary = "Top des offres par taux de conversion", description = "Récupère les offres avec le meilleur taux de conversion")
    @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<List<PostingMetricsDTO>> getTopByConversionRate(
            @Parameter(description = "Nombre maximum de résultats") @RequestParam(defaultValue = "5") int limit) {
        log.info("REST request to get top job posts by conversion rate, limit: {}", limit);
        List<PostingMetricsDTO> topMetrics = metricsService.getTopByConversionRate(limit);
        return ResponseEntity.ok(topMetrics);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rafraîchir les snapshots", description = "Génère les snapshots quotidiens des métriques")
    @ApiResponse(responseCode = "200", description = "Snapshots générés avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<Map<String, Integer>> refreshDailySnapshots() {
        log.info("REST request to refresh daily snapshots");
        int count = metricsService.generateDailySnapshots();
        return ResponseEntity.ok(Map.of("generatedCount", count));
    }
}
