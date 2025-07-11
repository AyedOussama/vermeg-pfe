package com.pfe2025.jobpostingservice.controller;


import com.pfe2025.jobpostingservice.dto.JobPostDTO;
import com.pfe2025.jobpostingservice.dto.PageResponseDTO;
import com.pfe2025.jobpostingservice.dto.SearchCriteriaDTO;
import com.pfe2025.jobpostingservice.model.enums.PostingStatus;
import com.pfe2025.jobpostingservice.service.JobPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des offres d'emploi.
 */
@RestController
@RequestMapping("/api/job-postings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Gestion des offres d'emploi", description = "Opérations pour créer, modifier, publier et fermer des offres d'emploi")
@SecurityRequirement(name = "bearerAuth")
public class JobPostController {

    private final JobPostService jobPostService;

    @PostMapping
    @PreAuthorize("hasRole('RH_ADMIN')")
    @Operation(summary = "Créer une offre d'emploi", description = "Crée une nouvelle offre d'emploi en état brouillon")
    @ApiResponse(responseCode = "201", description = "Offre créée avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "409", description = "Conflit de données (ex: offre déjà existante)")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<JobPostDTO.Response> createJobPost(@Valid @RequestBody JobPostDTO.Request requestDTO) {
        log.info("REST request to create a job post");
        JobPostDTO.Response response = jobPostService.createJobPost(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RH_ADMIN')")
    @Operation(summary = "Mettre à jour une offre d'emploi", description = "Met à jour une offre d'emploi existante")
    @ApiResponse(responseCode = "200", description = "Offre mise à jour avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Offre non trouvée")
    public ResponseEntity<JobPostDTO.Response> updateJobPost(
            @PathVariable Long id,
            @Valid @RequestBody JobPostDTO.Request requestDTO) {
        log.info("REST request to update job post : {}", id);
        JobPostDTO.Response response = jobPostService.updateJobPost(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('RH_ADMIN')")
    @Operation(summary = "Obtenir une offre d'emploi", description = "Récupère les détails d'une offre d'emploi")
    @ApiResponse(responseCode = "200", description = "Offre récupérée avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Offre non trouvée")
    public ResponseEntity<JobPostDTO.Response> getJobPost(@PathVariable Long id) {
        log.info("REST request to get job post : {}", id);
        JobPostDTO.Response response = jobPostService.getJobPostById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RH_ADMIN')")
    @Operation(summary = "Supprimer une offre d'emploi", description = "Supprime une offre d'emploi en état brouillon")
    @ApiResponse(responseCode = "204", description = "Offre supprimée avec succès")
    @ApiResponse(responseCode = "400", description = "Suppression impossible (statut non brouillon)")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Offre non trouvée")
    public ResponseEntity<Void> deleteJobPost(@PathVariable Long id) {
        log.info("REST request to delete job post : {}", id);
        jobPostService.deleteJobPost(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('RH_ADMIN')")
    @Operation(summary = "Publier une offre d'emploi", description = "Publie une offre d'emploi pour la rendre visible aux candidats")
    @ApiResponse(responseCode = "200", description = "Offre publiée avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides ou offre incomplète")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Offre non trouvée")
    public ResponseEntity<JobPostDTO.Response> publishJobPost(
            @PathVariable Long id,
            @Valid @RequestBody JobPostDTO.PublishRequest publishRequest) {
        log.info("REST request to publish job post : {}", id);
        JobPostDTO.Response response = jobPostService.publishJobPost(id, publishRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasRole('RH_ADMIN')")
    @Operation(summary = "Fermer une offre d'emploi", description = "Ferme une offre d'emploi publiée")
    @ApiResponse(responseCode = "200", description = "Offre fermée avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Offre non trouvée")
    public ResponseEntity<JobPostDTO.Response> closeJobPost(
            @PathVariable Long id,
            @Valid @RequestBody JobPostDTO.CloseRequest closeRequest) {
        log.info("REST request to close job post : {}", id);
        JobPostDTO.Response response = jobPostService.closeJobPost(id, closeRequest);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status/{status}")
    @PreAuthorize("hasRole('RH_ADMIN')")
    @Operation(summary = "Changer le statut d'une offre", description = "Change le statut d'une offre d'emploi")
    @ApiResponse(responseCode = "200", description = "Statut changé avec succès")
    @ApiResponse(responseCode = "400", description = "Transition de statut invalide")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Offre non trouvée")
    public ResponseEntity<JobPostDTO.Response> changeJobPostStatus(
            @PathVariable Long id,
            @PathVariable String status,
            @RequestParam(required = false) String comment) {
        log.info("REST request to change job post status : {} to {}", id, status);
        JobPostDTO.Response response = jobPostService.changeJobPostStatus(
                id,
                PostingStatus.valueOf(status.toUpperCase()),
                comment);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('RH_ADMIN')")
    @Operation(summary = "Rechercher des offres d'emploi", description = "Recherche des offres d'emploi avec pagination et filtrage")
    @ApiResponse(responseCode = "200", description = "Recherche effectuée avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<PageResponseDTO<JobPostDTO.Summary>> searchJobPosts(
            @Parameter(description = "Critères de recherche") SearchCriteriaDTO criteria,
            @Parameter(description = "Numéro de page (commence à 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Champ de tri") @RequestParam(defaultValue = "createdAt") String sort,
            @Parameter(description = "Direction du tri (asc ou desc)") @RequestParam(defaultValue = "desc") String direction) {
        log.info("REST request to search job posts with criteria: {}", criteria);

        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        PageResponseDTO<JobPostDTO.Summary> response = jobPostService.searchJobPosts(criteria, pageRequest);
        return ResponseEntity.ok(response);
    }
}
