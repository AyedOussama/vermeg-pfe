package com.pfe2025.jobpostingservice.controller;


import com.pfe2025.jobpostingservice.dto.ContentFragmentDTO;
import com.pfe2025.jobpostingservice.dto.PageResponseDTO;
import com.pfe2025.jobpostingservice.service.ContentFragmentService;
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
 * Contrôleur REST pour la gestion des fragments de contenu réutilisables.
 */
@RestController
@RequestMapping("/api/fragments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Fragments de contenu", description = "Opérations pour gérer les fragments de contenu réutilisables")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('RH_ADMIN')")
public class ContentFragmentController {

    private final ContentFragmentService fragmentService;

    @PostMapping
    @Operation(summary = "Créer un fragment", description = "Crée un nouveau fragment de contenu")
    @ApiResponse(responseCode = "201", description = "Fragment créé avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<ContentFragmentDTO.Response> createFragment(@Valid @RequestBody ContentFragmentDTO.Request requestDTO) {
        log.info("REST request to create a fragment with key: {}", requestDTO.getFragmentKey());
        ContentFragmentDTO.Response response = fragmentService.createFragment(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un fragment", description = "Met à jour un fragment de contenu existant")
    @ApiResponse(responseCode = "200", description = "Fragment mis à jour avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Fragment non trouvé")
    public ResponseEntity<ContentFragmentDTO.Response> updateFragment(
            @PathVariable Long id,
            @Valid @RequestBody ContentFragmentDTO.Request requestDTO) {
        log.info("REST request to update fragment : {}", id);
        ContentFragmentDTO.Response response = fragmentService.updateFragment(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un fragment", description = "Récupère les détails d'un fragment de contenu")
    @ApiResponse(responseCode = "200", description = "Fragment récupéré avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Fragment non trouvé")
    public ResponseEntity<ContentFragmentDTO.Response> getFragment(@PathVariable Long id) {
        log.info("REST request to get fragment : {}", id);
        ContentFragmentDTO.Response response = fragmentService.getFragmentById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un fragment", description = "Supprime un fragment de contenu")
    @ApiResponse(responseCode = "204", description = "Fragment supprimé avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Fragment non trouvé")
    public ResponseEntity<Void> deleteFragment(@PathVariable Long id) {
        log.info("REST request to delete fragment : {}", id);
        fragmentService.deleteFragment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/key/{key}")
    @Operation(summary = "Obtenir un fragment par clé", description = "Récupère un fragment de contenu par sa clé")
    @ApiResponse(responseCode = "200", description = "Fragment récupéré avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Fragment non trouvé")
    public ResponseEntity<ContentFragmentDTO.Response> getFragmentByKey(@PathVariable String key) {
        log.info("REST request to get fragment by key : {}", key);
        ContentFragmentDTO.Response response = fragmentService.getFragmentByKey(key);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/type/{type}/language/{language}")
    @Operation(summary = "Obtenir des fragments par type et langue", description = "Récupère tous les fragments actifs d'un type et d'une langue spécifiques")
    @ApiResponse(responseCode = "200", description = "Fragments récupérés avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<List<ContentFragmentDTO.Response>> getFragmentsByTypeAndLanguage(
            @PathVariable String type,
            @PathVariable String language) {
        log.info("REST request to get fragments by type : {} and language : {}", type, language);
        List<ContentFragmentDTO.Response> fragments = fragmentService.getFragmentsByTypeAndLanguage(type, language);
        return ResponseEntity.ok(fragments);
    }

    @GetMapping
    @Operation(summary = "Rechercher des fragments", description = "Recherche des fragments avec pagination et filtrage")
    @ApiResponse(responseCode = "200", description = "Recherche effectuée avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<PageResponseDTO<ContentFragmentDTO.Summary>> searchFragments(
            @Parameter(description = "Filtre sur l'état actif") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Filtre sur le type") @RequestParam(required = false) String type,
            @Parameter(description = "Filtre sur la langue") @RequestParam(required = false) String language,
            @Parameter(description = "Mot-clé de recherche") @RequestParam(required = false) String keyword,
            @Parameter(description = "Numéro de page (commence à 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Champ de tri") @RequestParam(defaultValue = "fragmentKey") String sort,
            @Parameter(description = "Direction du tri (asc ou desc)") @RequestParam(defaultValue = "asc") String direction) {
        log.info("REST request to search fragments with criteria: isActive={}, type={}, language={}, keyword={}",
                isActive, type, language, keyword);

        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        PageResponseDTO<ContentFragmentDTO.Summary> response =
                fragmentService.searchFragments(isActive, type, language, keyword, pageRequest);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activer un fragment", description = "Active un fragment de contenu")
    @ApiResponse(responseCode = "200", description = "Fragment activé avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Fragment non trouvé")
    public ResponseEntity<ContentFragmentDTO.Response> activateFragment(@PathVariable Long id) {
        log.info("REST request to activate fragment : {}", id);
        ContentFragmentDTO.Response response = fragmentService.setFragmentActive(id, true);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Désactiver un fragment", description = "Désactive un fragment de contenu")
    @ApiResponse(responseCode = "200", description = "Fragment désactivé avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    @ApiResponse(responseCode = "404", description = "Fragment non trouvé")
    public ResponseEntity<ContentFragmentDTO.Response> deactivateFragment(@PathVariable Long id) {
        log.info("REST request to deactivate fragment : {}", id);
        ContentFragmentDTO.Response response = fragmentService.setFragmentActive(id, false);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Obtenir des suggestions de fragments", description = "Récupère des suggestions de fragments pour l'autocomplétion")
    @ApiResponse(responseCode = "200", description = "Suggestions récupérées avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé")
    public ResponseEntity<List<ContentFragmentDTO.Summary>> getFragmentSuggestions(
            @Parameter(description = "Préfixe de recherche") @RequestParam String prefix,
            @Parameter(description = "Nombre maximum de résultats") @RequestParam(defaultValue = "10") int limit) {
        log.info("REST request to get fragment suggestions for prefix : {}, limit: {}", prefix, limit);
        List<ContentFragmentDTO.Summary> suggestions = fragmentService.getFragmentSuggestions(prefix, limit);
        return ResponseEntity.ok(suggestions);
    }
}
