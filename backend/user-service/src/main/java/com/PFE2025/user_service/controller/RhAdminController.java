package com.PFE2025.user_service.controller;

import com.PFE2025.user_service.dto.request.RhAdminUpdateRequest;
import com.PFE2025.user_service.dto.response.ApiError;
import com.PFE2025.user_service.dto.response.RhAdminProfileResponse;
import com.PFE2025.user_service.service.RhAdminService;

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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour la gestion des profils RH Admin.
 * Fournit tous les endpoints CRUD pour les RH Admins.
 */
@RestController
@RequestMapping("/profiles/rh-admins")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "RH Admin Management", description = "APIs pour la gestion des profils RH Admin")
@SecurityRequirement(name = "BearerAuth")
public class RhAdminController {

    private final RhAdminService rhAdminService;

    @Operation(
        summary = "Lister tous les profils RH Admin",
        description = "Récupère une liste paginée de tous les profils RH Admin avec possibilité de recherche et filtrage"
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
    public ResponseEntity<Page<RhAdminProfileResponse>> getAllRhAdmins(
            @Parameter(description = "Mot-clé de recherche (nom, département, localisation)")
            @RequestParam(required = false) String search,
            
            @Parameter(description = "Filtrer par département")
            @RequestParam(required = false) String department,
            
            @Parameter(description = "Filtrer par niveau d'accès")
            @RequestParam(required = false) String accessLevel,
            
            @Parameter(description = "Filtrer par localisation")
            @RequestParam(required = false) String location,
            
            @Parameter(description = "Filtrer par spécialisation RH")
            @RequestParam(required = false) String specialization,
            
            @Parameter(description = "Expérience minimale en recrutement (années)")
            @RequestParam(required = false) Integer minRecruitmentExperience,

            @ParameterObject
            @PageableDefault(size = 20, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable) {

        log.debug("REST request to get RH Admins - search: {}, department: {}, accessLevel: {}, location: {}, specialization: {}, minRecruitmentExperience: {}", 
                search, department, accessLevel, location, specialization, minRecruitmentExperience);

        Page<RhAdminProfileResponse> result;

        if (search != null && !search.isBlank()) {
            result = rhAdminService.searchRhAdmins(search, pageable);
        } else if (department != null && !department.isBlank()) {
            result = rhAdminService.getRhAdminsByDepartment(department, pageable);
        } else if (accessLevel != null && !accessLevel.isBlank()) {
            result = rhAdminService.getRhAdminsByAccessLevel(accessLevel, pageable);
        } else if (location != null && !location.isBlank()) {
            result = rhAdminService.getRhAdminsByLocation(location, pageable);
        } else if (specialization != null && !specialization.isBlank()) {
            result = rhAdminService.getRhAdminsBySpecialization(specialization, pageable);
        } else if (minRecruitmentExperience != null) {
            result = rhAdminService.getRhAdminsByMinRecruitmentExperience(minRecruitmentExperience, pageable);
        } else {
            result = rhAdminService.getAllRhAdmins(pageable);
        }

        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "Obtenir un profil RH Admin par ID",
        description = "Récupère le profil complet d'un RH Admin par son ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil récupéré avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = RhAdminProfileResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Profil RH Admin non trouvé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<RhAdminProfileResponse> getRhAdminById(
            @Parameter(description = "ID du profil RH Admin", required = true)
            @PathVariable String id) {

        log.debug("REST request to get RH Admin profile by id: {}", id);
        RhAdminProfileResponse profile = rhAdminService.getRhAdminByKeycloakId(id);
        return ResponseEntity.ok(profile);
    }

    @Operation(
        summary = "Obtenir un profil RH Admin par Keycloak ID",
        description = "Récupère le profil complet d'un RH Admin par son ID Keycloak"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil récupéré avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = RhAdminProfileResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Profil RH Admin non trouvé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/keycloak/{keycloakId}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<RhAdminProfileResponse> getRhAdminByKeycloakId(
            @Parameter(description = "ID Keycloak du RH Admin", required = true)
            @PathVariable String keycloakId) {

        log.debug("REST request to get RH Admin profile by keycloakId: {}", keycloakId);
        RhAdminProfileResponse profile = rhAdminService.getRhAdminByKeycloakId(keycloakId);
        return ResponseEntity.ok(profile);
    }

    @Operation(
        summary = "Mettre à jour un profil RH Admin",
        description = "Met à jour les informations d'un profil RH Admin existant"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil mis à jour avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = RhAdminProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "Données invalides",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Profil RH Admin non trouvé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<RhAdminProfileResponse> updateRhAdmin(
            @Parameter(description = "ID du profil RH Admin", required = true)
            @PathVariable String id,
            
            @Parameter(description = "Nouvelles données du profil", required = true)
            @Valid @RequestBody RhAdminUpdateRequest request) {

        log.debug("REST request to update RH Admin profile with id: {}", id);
        RhAdminProfileResponse updatedProfile = rhAdminService.updateRhAdmin(id, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @Operation(
        summary = "Supprimer un profil RH Admin",
        description = "Supprime définitivement un profil RH Admin et son compte associé"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Profil supprimé avec succès"),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé (CEO requis)",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Profil RH Admin non trouvé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CEO')")
    public ResponseEntity<Void> deleteRhAdmin(
            @Parameter(description = "ID du profil RH Admin", required = true)
            @PathVariable String id) {

        log.debug("REST request to delete RH Admin profile with id: {}", id);
        rhAdminService.deleteRhAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Compter les profils RH Admin",
        description = "Retourne le nombre total de profils RH Admin"
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
    public ResponseEntity<Long> countRhAdmins() {
        log.debug("REST request to count RH Admins");
        long count = rhAdminService.countRhAdmins();
        return ResponseEntity.ok(count);
    }
}
