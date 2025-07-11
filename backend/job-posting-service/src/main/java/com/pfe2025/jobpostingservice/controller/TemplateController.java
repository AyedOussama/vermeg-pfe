package com.pfe2025.jobpostingservice.controller;


import com.pfe2025.jobpostingservice.dto.PageResponseDTO;
import com.pfe2025.jobpostingservice.dto.PostingTemplateDTO;
import com.pfe2025.jobpostingservice.service.TemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
 * Contrôleur REST pour la gestion des modèles d'offres d'emploi.
 */
@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Gestion des modèles", description = "Opérations pour gérer les modèles d'offres d'emploi")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('RH_ADMIN')")
public class TemplateController {

    private final TemplateService templateService;

    @PostMapping
    @Operation(summary = "Créer un modèle", description = "Crée un nouveau modèle d'offre d'emploi")
    @ApiResponse(responseCode = "201", description = "Modèle créé avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<PostingTemplateDTO.Response> createTemplate(@Valid @RequestBody PostingTemplateDTO.Request requestDTO) {
        log.info("REST request to create a template");
        PostingTemplateDTO.Response response = templateService.createTemplate(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un modèle", description = "Met à jour un modèle d'offre d'emploi existant")
    @ApiResponse(responseCode = "200", description = "Modèle mis à jour avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Modèle non trouvé")
    public ResponseEntity<PostingTemplateDTO.Response> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody PostingTemplateDTO.Request requestDTO) {
        log.info("REST request to update template : {}", id);
        PostingTemplateDTO.Response response = templateService.updateTemplate(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un modèle", description = "Récupère les détails d'un modèle d'offre d'emploi")
    @ApiResponse(responseCode = "200", description = "Modèle récupéré avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Modèle non trouvé")
    public ResponseEntity<PostingTemplateDTO.Response> getTemplate(@PathVariable Long id) {
        log.info("REST request to get template : {}", id);
        PostingTemplateDTO.Response response = templateService.getTemplateById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un modèle", description = "Supprime un modèle d'offre d'emploi")
    @ApiResponse(responseCode = "204", description = "Modèle supprimé avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Modèle non trouvé")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        log.info("REST request to delete template : {}", id);
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    @Operation(summary = "Liste des modèles actifs", description = "Récupère tous les modèles actifs")
    @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<List<PostingTemplateDTO.Summary>> getAllActiveTemplates() {
        log.info("REST request to get all active templates");
        List<PostingTemplateDTO.Summary> templates = templateService.getAllActiveTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping
    @Operation(summary = "Rechercher des modèles", description = "Recherche des modèles avec pagination et filtrage")
    @ApiResponse(responseCode = "200", description = "Recherche effectuée avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<PageResponseDTO<PostingTemplateDTO.Summary>> searchTemplates(
            @Parameter(description = "Filtre sur l'état actif") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Filtre sur le département") @RequestParam(required = false) String department,
            @Parameter(description = "Mot-clé de recherche") @RequestParam(required = false) String keyword,
            @Parameter(description = "Numéro de page (commence à 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Champ de tri") @RequestParam(defaultValue = "name") String sort,
            @Parameter(description = "Direction du tri (asc ou desc)") @RequestParam(defaultValue = "asc") String direction) {
        log.info("REST request to search templates with criteria: isActive={}, department={}, keyword={}",
                isActive, department, keyword);

        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        PageResponseDTO<PostingTemplateDTO.Summary> response =
                templateService.searchTemplates(isActive, department, keyword, pageRequest);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activer un modèle", description = "Active un modèle d'offre d'emploi")
    @ApiResponse(responseCode = "200", description = "Modèle activé avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Modèle non trouvé")
    public ResponseEntity<PostingTemplateDTO.Response> activateTemplate(@PathVariable Long id) {
        log.info("REST request to activate template : {}", id);
        PostingTemplateDTO.Response response = templateService.setTemplateActive(id, true);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Désactiver un modèle", description = "Désactive un modèle d'offre d'emploi")
    @ApiResponse(responseCode = "200", description = "Modèle désactivé avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Modèle non trouvé")
    public ResponseEntity<PostingTemplateDTO.Response> deactivateTemplate(@PathVariable Long id) {
        log.info("REST request to deactivate template : {}", id);
        PostingTemplateDTO.Response response = templateService.setTemplateActive(id, false);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/department/{department}")
    @Operation(summary = "Obtenir un modèle par département", description = "Récupère un modèle actif pour un département spécifique")
    @ApiResponse(responseCode = "200", description = "Modèle récupéré avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Aucun modèle trouvé pour ce département")
    public ResponseEntity<PostingTemplateDTO.Response> getTemplateByDepartment(@PathVariable String department) {
        log.info("REST request to get template for department : {}", department);
        return templateService.findActiveTemplateByDepartment(department)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
