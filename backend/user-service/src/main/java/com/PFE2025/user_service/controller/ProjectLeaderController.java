package com.PFE2025.user_service.controller;

import com.PFE2025.user_service.dto.request.ProjectLeaderUpdateRequest;
import com.PFE2025.user_service.dto.response.ApiError;
import com.PFE2025.user_service.dto.response.ProjectLeaderProfileResponse;
import com.PFE2025.user_service.service.ProjectLeaderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour la gestion des profils Project Leader.
 * Fournit tous les endpoints CRUD pour les Project Leaders.
 */
@RestController
@RequestMapping("/profiles/project-leaders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Project Leader Management", description = "APIs pour la gestion des profils Project Leader")
@SecurityRequirement(name = "BearerAuth")
public class ProjectLeaderController {

    private final ProjectLeaderService projectLeaderService;

    @Operation(
        summary = "Lister tous les profils Project Leader",
        description = "Récupère une liste paginée de tous les profils Project Leader avec possibilité de recherche et filtrage"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<Page<ProjectLeaderProfileResponse>> getAllProjectLeaders(
            @Parameter(description = "Mot-clé de recherche (nom, département, localisation)")
            @RequestParam(required = false) String search,
            
            @Parameter(description = "Filtrer par département")
            @RequestParam(required = false) String department,
            
            @Parameter(description = "Filtrer par niveau de management")
            @RequestParam(required = false) String managementLevel,
            
            @Parameter(description = "Filtrer par localisation")
            @RequestParam(required = false) String location,
            
            @Parameter(description = "Expérience minimale en années")
            @RequestParam(required = false) Integer minExperience,

            @ParameterObject
            @PageableDefault(size = 20, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable) {

        log.debug("REST request to get Project Leaders - search: {}, department: {}, managementLevel: {}, location: {}, minExperience: {}", 
                search, department, managementLevel, location, minExperience);

        Page<ProjectLeaderProfileResponse> result;

        if (search != null && !search.isBlank()) {
            result = projectLeaderService.searchProjectLeaders(search, pageable);
        } else if (department != null && !department.isBlank()) {
            result = projectLeaderService.getProjectLeadersByDepartment(department, pageable);
        } else if (managementLevel != null && !managementLevel.isBlank()) {
            result = projectLeaderService.getProjectLeadersByManagementLevel(managementLevel, pageable);
        } else if (location != null && !location.isBlank()) {
            result = projectLeaderService.getProjectLeadersByLocation(location, pageable);
        } else if (minExperience != null) {
            result = projectLeaderService.getProjectLeadersByMinExperience(minExperience, pageable);
        } else {
            result = projectLeaderService.getAllProjectLeaders(pageable);
        }

        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "Obtenir un profil Project Leader par ID",
        description = "Récupère le profil complet d'un Project Leader par son ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil récupéré avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectLeaderProfileResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Profil Project Leader non trouvé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'PROJECT_LEADER')")
    public ResponseEntity<ProjectLeaderProfileResponse> getProjectLeaderById(
            @Parameter(description = "ID du profil Project Leader", required = true)
            @PathVariable String id) {

        log.debug("REST request to get Project Leader profile by id: {}", id);
        ProjectLeaderProfileResponse profile = projectLeaderService.getProjectLeaderById(id);
        return ResponseEntity.ok(profile);
    }

    @Operation(
        summary = "Obtenir un profil Project Leader par Keycloak ID",
        description = "Récupère le profil complet d'un Project Leader par son ID Keycloak"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil récupéré avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectLeaderProfileResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Profil Project Leader non trouvé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/keycloak/{keycloakId}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'PROJECT_LEADER')")
    public ResponseEntity<ProjectLeaderProfileResponse> getProjectLeaderByKeycloakId(
            @Parameter(description = "ID Keycloak du Project Leader", required = true)
            @PathVariable String keycloakId) {

        log.debug("REST request to get Project Leader profile by keycloakId: {}", keycloakId);
        ProjectLeaderProfileResponse profile = projectLeaderService.getProjectLeaderByKeycloakId(keycloakId);
        return ResponseEntity.ok(profile);
    }

    @Operation(
        summary = "Mettre à jour un profil Project Leader",
        description = "Met à jour les informations d'un profil Project Leader existant"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil mis à jour avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectLeaderProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "Données invalides",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Profil Project Leader non trouvé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<ProjectLeaderProfileResponse> updateProjectLeader(
            @Parameter(description = "ID du profil Project Leader", required = true)
            @PathVariable String id,
            
            @Parameter(description = "Nouvelles données du profil", required = true)
            @Valid @RequestBody ProjectLeaderUpdateRequest request) {

        log.debug("REST request to update Project Leader profile with id: {}", id);
        ProjectLeaderProfileResponse updatedProfile = projectLeaderService.updateProjectLeader(id, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @Operation(
        summary = "Supprimer un profil Project Leader",
        description = "Supprime définitivement un profil Project Leader et son compte associé"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Profil supprimé avec succès"),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé (CEO requis)",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Profil Project Leader non trouvé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CEO')")
    public ResponseEntity<Void> deleteProjectLeader(
            @Parameter(description = "ID du profil Project Leader", required = true)
            @PathVariable String id) {

        log.debug("REST request to delete Project Leader profile with id: {}", id);
        projectLeaderService.deleteProjectLeader(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Compter les profils Project Leader",
        description = "Retourne le nombre total de profils Project Leader"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Nombre récupéré avec succès"),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<Long> countProjectLeaders() {
        log.debug("REST request to count Project Leaders");
        long count = projectLeaderService.countProjectLeaders();
        return ResponseEntity.ok(count);
    }
}
