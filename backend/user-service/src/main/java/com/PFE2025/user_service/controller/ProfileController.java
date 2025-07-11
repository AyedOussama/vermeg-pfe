package com.PFE2025.user_service.controller;

import com.PFE2025.user_service.dto.response.CandidateProfileResponse;
import com.PFE2025.user_service.exception.ApiError;
import com.PFE2025.user_service.service.ProfileService;
import com.PFE2025.user_service.service.CandidateService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

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
 * Contrôleur pour la gestion des profils utilisateurs.
 * Gère les profils candidats complets et les profils utilisateurs basiques.
 */
@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Profile Management", description = "Endpoints pour la gestion des profils utilisateurs")
@SecurityRequirement(name = "bearer-auth")
public class ProfileController {

    private final ProfileService profileService;
    private final CandidateService candidateService;
    
    @Operation(
        summary = "Get current user profile", 
        description = "Récupère le profil complet de l'utilisateur connecté. " +
                     "Pour les candidats, retourne le profil enrichi avec les données IA. " +
                     "Pour les autres utilisateurs, retourne le profil basique."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Profil récupéré avec succès",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(description = "Profil utilisateur (CandidateProfileResponse pour candidats, UserDTO pour autres)")
            )
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Non authentifié",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))
        ),
        @ApiResponse(
            responseCode = "404", 
            description = "Profil utilisateur non trouvé",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))
        )
    })
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'RH_ADMIN', 'PROJECT_LEADER', 'CEO')")
    public ResponseEntity<Object> getCurrentUserProfile() {
        log.debug("REST request to get current user profile");
        
        Object profile = profileService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }
    
    @Operation(
        summary = "Get candidate profile by ID", 
        description = "Récupère le profil complet d'un candidat par son ID Keycloak. " +
                     "Accessible uniquement aux RH_ADMIN, PROJECT_LEADER et CEO."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Profil candidat récupéré avec succès",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = CandidateProfileResponse.class))
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Non authentifié",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "Accès refusé",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))
        ),
        @ApiResponse(
            responseCode = "404", 
            description = "Profil candidat non trouvé",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))
        )
    })
    @GetMapping("/candidate/{keycloakId}")
    @PreAuthorize("hasAnyRole('RH_ADMIN', 'PROJECT_LEADER', 'CEO')")
    public ResponseEntity<CandidateProfileResponse> getCandidateProfile(
            @Parameter(description = "ID Keycloak du candidat", required = true)
            @PathVariable String keycloakId) {
        
        log.debug("REST request to get candidate profile for keycloakId: {}", keycloakId);
        
        CandidateProfileResponse profile = profileService.getCandidateProfile(keycloakId);
        return ResponseEntity.ok(profile);
    }
    
    @Operation(
        summary = "Update candidate photo", 
        description = "Met à jour la photo de profil d'un candidat. " +
                     "Le candidat peut mettre à jour sa propre photo."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Photo mise à jour avec succès",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = CandidateProfileResponse.class))
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "URL de photo invalide",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Non authentifié",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))
        ),
        @ApiResponse(
            responseCode = "404", 
            description = "Profil candidat non trouvé",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))
        )
    })
    @PutMapping("/photo")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileResponse> updatePhoto(
            @Parameter(description = "URL de la nouvelle photo", required = true)
            @RequestParam String photoUrl) {
        
        log.debug("REST request to update photo with URL: {}", photoUrl);
        
        // L'ID Keycloak sera récupéré depuis le JWT dans le service
        // Pour cette version, on utilise une méthode qui récupère l'utilisateur connecté
        // TODO: Implémenter la logique pour récupérer le keycloakId depuis le JWT
        
        // Temporairement, on lève une exception pour indiquer que cette fonctionnalité
        // sera implémentée dans une version future
        throw new UnsupportedOperationException("Photo update will be implemented in a future version");
    }

    @Operation(
        summary = "Lister tous les profils candidats",
        description = "Récupère une liste paginée de tous les profils candidats avec possibilité de recherche et filtrage"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/candidates")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'PROJECT_LEADER')")
    public ResponseEntity<Page<CandidateProfileResponse>> getAllCandidateProfiles(
            @Parameter(description = "Mot-clé de recherche (nom, compétences, localisation)")
            @RequestParam(required = false) String search,

            @Parameter(description = "Filtrer par localisation")
            @RequestParam(required = false) String location,

            @Parameter(description = "Filtrer par niveau d'expérience")
            @RequestParam(required = false) String experienceLevel,

            @ParameterObject
            @PageableDefault(size = 20, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable) {

        log.debug("REST request to get all candidate profiles - search: {}, location: {}, experienceLevel: {}",
                search, location, experienceLevel);

        Page<CandidateProfileResponse> result;

        if (search != null && !search.isBlank()) {
            result = candidateService.searchCandidates(search, pageable);
        } else if (location != null && !location.isBlank()) {
            result = candidateService.getCandidatesByLocation(location, pageable);
        } else if (experienceLevel != null && !experienceLevel.isBlank()) {
            result = candidateService.getCandidatesByExperienceLevel(experienceLevel, pageable);
        } else {
            result = candidateService.getAllCandidates(pageable);
        }

        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "Obtenir un profil candidat par ID",
        description = "Récupère le profil complet d'un candidat par son ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil récupéré avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = CandidateProfileResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Profil candidat non trouvé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/candidates/{keycloakId}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'PROJECT_LEADER')")
    public ResponseEntity<CandidateProfileResponse> getCandidateProfileByKeycloakId(
            @Parameter(description = "keycloakId du profil candidat", required = true)
            @PathVariable String keycloakId) {

        log.debug("REST request to get candidate profile by keycloakId: {}", keycloakId);
        CandidateProfileResponse profile = candidateService.getCandidateByKeycloakId(keycloakId);
        return ResponseEntity.ok(profile);
    }

    @Operation(
        summary = "Compter les profils candidats",
        description = "Retourne le nombre total de profils candidats"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Nombre récupéré avec succès"),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/candidates/count")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'PROJECT_LEADER')")
    public ResponseEntity<Long> countCandidateProfiles() {
        log.debug("REST request to count candidate profiles");
        long count = candidateService.countCandidates();
        return ResponseEntity.ok(count);
    }
}
