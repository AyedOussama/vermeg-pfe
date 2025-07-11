package com.PFE2025.user_service.controller;

import com.PFE2025.user_service.dto.request.CeoUpdateRequest;
import com.PFE2025.user_service.dto.response.CeoProfileResponse;
import com.PFE2025.user_service.service.CeoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * Contrôleur REST pour la gestion des profils CEO.
 * Fournit les endpoints CRUD et de recherche pour les profils CEO.
 */
@RestController
@RequestMapping("/profiles/ceo")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "CEO Management",
     description = "APIs complètes pour la gestion des profils CEO avec recherche avancée, filtres et pagination optimisée")
@SecurityRequirement(name = "bearerAuth")
public class CeoController {

    private final CeoService ceoService;

    /**
     * Récupère tous les profils CEO avec pagination et filtres
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    @Operation(summary = "Lister tous les profils CEO", 
               description = "Récupère tous les profils CEO avec pagination et filtres optionnels")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des profils CEO récupérée avec succès"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - rôle insuffisant"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public ResponseEntity<Page<CeoProfileResponse>> getAllCeos(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            @Parameter(description = "Mot-clé de recherche (nom, email, localisation)")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filtrer par localisation")
            @RequestParam(required = false) String location) {

        log.debug("REST request to get CEO profiles with filters - search: {}, location: {}",
                  search, location);

        Page<CeoProfileResponse> result;

        if (search != null && !search.isBlank()) {
            result = ceoService.searchCeos(search, pageable);
        } else if (location != null && !location.isBlank()) {
            result = ceoService.getCeosByLocation(location, pageable);
        } else {
            result = ceoService.getAllCeos(pageable);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Récupère un profil CEO par son keycloakId
     */
    @GetMapping("/{keycloakId}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    @Operation(summary = "Obtenir un profil CEO par keycloakId",
               description = "Récupère un profil CEO spécifique par son identifiant Keycloak")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil CEO trouvé"),
        @ApiResponse(responseCode = "404", description = "Profil CEO non trouvé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public ResponseEntity<CeoProfileResponse> getCeoByKeycloakId(
            @Parameter(description = "keycloakId du profil CEO", required = true)
            @PathVariable String keycloakId) {

        log.debug("REST request to get CEO profile by keycloakId: {}", keycloakId);
        CeoProfileResponse profile = ceoService.getCeoByKeycloakId(keycloakId);
        return ResponseEntity.ok(profile);
    }



    /**
     * Met à jour un profil CEO
     */
    @PutMapping("/{keycloakId}")
    @PreAuthorize("hasRole('CEO')")
    @Operation(summary = "Mettre à jour un profil CEO",
               description = "Met à jour les informations d'un profil CEO existant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil CEO mis à jour avec succès"),
        @ApiResponse(responseCode = "404", description = "Profil CEO non trouvé"),
        @ApiResponse(responseCode = "400", description = "Données de mise à jour invalides"),
        @ApiResponse(responseCode = "403", description = "Accès refusé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public ResponseEntity<CeoProfileResponse> updateCeoByKeycloakId(
            @Parameter(description = "keycloakId du profil CEO à mettre à jour", required = true)
            @PathVariable String keycloakId,
            @Parameter(description = "Nouvelles données du profil", required = true)
            @Valid @RequestBody CeoUpdateRequest request) {

        log.debug("REST request to update CEO profile with keycloakId: {}", keycloakId);
        CeoProfileResponse updatedProfile = ceoService.updateCeoByKeycloakId(keycloakId, request);
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * Supprime un profil CEO
     */
    @DeleteMapping("/{keycloakId}")
    @PreAuthorize("hasRole('CEO')")
    @Operation(summary = "Supprimer un profil CEO",
               description = "Supprime définitivement un profil CEO")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Profil CEO supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Profil CEO non trouvé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public ResponseEntity<Void> deleteCeoByKeycloakId(
            @Parameter(description = "keycloakId du profil CEO à supprimer", required = true)
            @PathVariable String keycloakId) {

        log.debug("REST request to delete CEO profile with keycloakId: {}", keycloakId);
        ceoService.deleteCeoByKeycloakId(keycloakId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Compte le nombre total de profils CEO
     */
    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    @Operation(summary = "Compter les profils CEO", 
               description = "Retourne le nombre total de profils CEO")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Nombre de profils CEO récupéré"),
        @ApiResponse(responseCode = "403", description = "Accès refusé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public ResponseEntity<Long> countCeoProfiles() {
        log.debug("REST request to count CEO profiles");
        long count = ceoService.countCeos();
        return ResponseEntity.ok(count);
    }
}
