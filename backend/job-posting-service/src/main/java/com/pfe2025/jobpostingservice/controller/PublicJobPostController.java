package com.pfe2025.jobpostingservice.controller;

import com.pfe2025.jobpostingservice.dto.JobPostDTO;
import com.pfe2025.jobpostingservice.dto.PageResponseDTO;
import com.pfe2025.jobpostingservice.dto.SearchCriteriaDTO;
import com.pfe2025.jobpostingservice.model.enums.EmploymentType;
import com.pfe2025.jobpostingservice.service.JobPostService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * Contrôleur REST pour l'accès public aux offres d'emploi.
 */
@RestController
@RequestMapping("/api/public/job-postings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Offres d'emploi publiques", description = "API publique pour la consultation des offres d'emploi")
public class PublicJobPostController {

    private final JobPostService jobPostService;

    /**
     * Récupère les offres d'emploi publiées avec pagination.
     */
    @GetMapping
    @Operation(summary = "Récupérer les offres publiées", description = "Récupère toutes les offres d'emploi publiées et actives")
    public ResponseEntity<PageResponseDTO<JobPostDTO.PublicView>> getPublishedJobPosts(
            @Parameter(description = "Numéro de page (commence à 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Champ de tri") @RequestParam(defaultValue = "publishedAt") String sort,
            @Parameter(description = "Direction du tri (asc ou desc)") @RequestParam(defaultValue = "desc") String direction) {

        log.info("Public REST request to get published job posts");

        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        try {
            PageResponseDTO<JobPostDTO.PublicView> response = jobPostService.getPublishedJobPosts(pageRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving published job posts: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Récupère les détails d'une offre d'emploi publiée par son identifiant.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Consulter une offre publiée", description = "Récupère les détails d'une offre d'emploi publiée")
    public ResponseEntity<JobPostDTO.PublicView> getPublishedJobPost(@PathVariable Long id) {
        log.info("Public REST request to get job post : {}", id);

        try {
            // Récupérer l'offre complète
            JobPostDTO.Response fullResponse = jobPostService.getJobPostById(id);

            // Incrémenter les compteurs de vues de manière asynchrone
            jobPostService.incrementViewCount(id, true);

            // Convertir en vue publique
            JobPostDTO.PublicView publicView = convertToPublicView(fullResponse);

            return ResponseEntity.ok(publicView);
        } catch (Exception e) {
            log.error("Error retrieving published job post with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Recherche parmi les offres d'emploi publiées selon différents critères.
     */
    @GetMapping("/search")
    @Operation(summary = "Rechercher des offres publiées", description = "Recherche parmi les offres d'emploi publiées")
    public ResponseEntity<PageResponseDTO<JobPostDTO.PublicView>> searchPublishedJobPosts(
            @Parameter(description = "Mot-clé") @RequestParam(required = false) String keyword,
            @Parameter(description = "Département") @RequestParam(required = false) String department,
            @Parameter(description = "Localisation") @RequestParam(required = false) String location,
            @Parameter(description = "Type de contrat") @RequestParam(required = false) String employmentType,
            @Parameter(description = "Expérience minimale") @RequestParam(required = false) Integer minExperience,
            @Parameter(description = "Compétences requises") @RequestParam(required = false) String[] skills,
            @Parameter(description = "Numéro de page (commence à 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "10") int size) {

        log.info("Public REST request to search published job posts");

        try {
            // Construire les critères de recherche
            SearchCriteriaDTO criteria = new SearchCriteriaDTO();
            criteria.setKeyword(keyword);
            criteria.setDepartment(department);
            criteria.setLocation(location);

            if (employmentType != null) {
                criteria.setEmploymentType(EmploymentType.valueOf(employmentType.toUpperCase()));
            }

            criteria.setMinExperience(minExperience);

            if (skills != null && skills.length > 0) {
                criteria.setSkillNames(Set.of(skills));
            }

            // Toujours filtrer sur les offres publiées pour l'API publique
            criteria.setPublishedOnly(true);

            PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));

            // Effectuer la recherche
            PageResponseDTO<JobPostDTO.Summary> searchResults = jobPostService.searchJobPosts(criteria, pageRequest);

            // Convertir en vues publiques
            List<JobPostDTO.PublicView> publicViews = searchResults.getContent().stream()
                    .map(this::convertSummaryToPublicView)
                    .toList();

            // Construire la réponse paginée
            PageResponseDTO<JobPostDTO.PublicView> response = PageResponseDTO.<JobPostDTO.PublicView>builder()
                    .content(publicViews)
                    .pageNumber(searchResults.getPageNumber())
                    .pageSize(searchResults.getPageSize())
                    .totalElements(searchResults.getTotalElements())
                    .totalPages(searchResults.getTotalPages())
                    .first(searchResults.isFirst())
                    .last(searchResults.isLast())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching published job posts: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Enregistre une vue sur une offre d'emploi.
     */
    @PostMapping("/{id}/view")
    @Operation(summary = "Enregistrer une vue", description = "Enregistre une vue sur une offre d'emploi")
    public ResponseEntity<Void> recordView(
            @PathVariable Long id,
            @Parameter(description = "Indique s'il s'agit d'une vue unique") @RequestParam(defaultValue = "true") boolean unique) {

        log.info("Public REST request to record view for job post : {}, unique: {}", id, unique);

        try {
            // Enregistrer la vue de manière asynchrone
            jobPostService.incrementViewCount(id, unique);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error recording view for job post with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Convertit une réponse complète en vue publique.
     */
    private JobPostDTO.PublicView convertToPublicView(JobPostDTO.Response response) {
        return JobPostDTO.PublicView.builder()
                .id(response.getId())
                .title(response.getTitle())
                .department(response.getDepartment())
                .location(response.getLocation())
                .employmentType(response.getEmploymentType())
                .description(response.getDescription())
                .responsibilities(response.getResponsibilities())
                .qualifications(response.getQualifications())
                .benefits(response.getBenefits())
                .minExperience(response.getMinExperience())
                .publishedAt(response.getPublishedAt())
                .skills(response.getSkills())
                // Formater la plage salariale si le salaire est affiché
                .salaryRange(formatSalaryRange(response))
                .build();
    }

    /**
     * Convertit un résumé en vue publique.
     */
    private JobPostDTO.PublicView convertSummaryToPublicView(JobPostDTO.Summary summary) {
        return JobPostDTO.PublicView.builder()
                .id(summary.getId())
                .title(summary.getTitle())
                .department(summary.getDepartment())
                .location(summary.getLocation())
                .employmentType(summary.getEmploymentType())
                .publishedAt(summary.getPublishedAt())
                .build();
    }

    /**
     * Formate la plage salariale pour l'affichage public.
     */
    private String formatSalaryRange(JobPostDTO.Response response) {
        if (response.getDisplaySalary() != null && response.getDisplaySalary()) {
            if (response.getSalaryRangeMin() != null && response.getSalaryRangeMax() != null) {
                return String.format("%s € - %s €",
                        response.getSalaryRangeMin().toString(),
                        response.getSalaryRangeMax().toString());
            } else if (response.getSalaryRangeMin() != null) {
                return String.format("À partir de %s €", response.getSalaryRangeMin().toString());
            } else if (response.getSalaryRangeMax() != null) {
                return String.format("Jusqu'à %s €", response.getSalaryRangeMax().toString());
            }
        }
        return "Non communiqué";
    }
}