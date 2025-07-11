package com.PFE2025.user_service.controller;


import com.PFE2025.user_service.dto.request.PasswordChangeRequest;
import com.PFE2025.user_service.dto.request.ProjectLeaderCreateRequest;
import com.PFE2025.user_service.dto.request.RhAdminCreateRequest;
import com.PFE2025.user_service.dto.request.RoleUpdateRequest;
import com.PFE2025.user_service.dto.request.StatusUpdateRequest;
import com.PFE2025.user_service.dto.request.UserCreateRequest;
import com.PFE2025.user_service.dto.request.UserUpdateRequest;
import com.PFE2025.user_service.dto.response.ApiError;

import com.PFE2025.user_service.dto.response.ProjectLeaderProfileResponse;
import com.PFE2025.user_service.dto.response.RhAdminProfileResponse;
import com.PFE2025.user_service.dto.response.UserDTO;
import com.PFE2025.user_service.service.AdminService;

import com.PFE2025.user_service.service.ProjectLeaderService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin User Management", description = "APIs for managing internal users and candidates by administrators")
@SecurityRequirement(name = "BearerAuth")
public class AdminController {

    private final AdminService adminUserService;
    private final ProjectLeaderService projectLeaderService;
    private final RhAdminService rhAdminService;

    @Operation(summary = "Create an internal user", description = "Creates a new internal user with specified roles")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid data",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Access denied",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "User already exists",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "503", description = "Authentication service unavailable",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('CEO')")
    public ResponseEntity<UserDTO> createUser(
            @Parameter(description = "Details of the user to create", required = true)
            @Valid @RequestBody UserCreateRequest request) {

        logAuthenticationDetails("createUser");
        log.debug("REST request to create user with email: {}", request.getEmail());
        UserDTO result = adminUserService.createInternalUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @Operation(
        summary = "Créer un Project Leader avec profil complet",
        description = "Crée un nouveau Project Leader avec son compte Keycloak et son profil spécialisé"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Project Leader créé avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectLeaderProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "Données invalides",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé (CEO requis)",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "409", description = "Email déjà utilisé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "503", description = "Service d'authentification indisponible",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping("/project-leaders")
    @PreAuthorize("hasRole('CEO')")
    public ResponseEntity<ProjectLeaderProfileResponse> createProjectLeader(
            @Parameter(description = "Données complètes du Project Leader à créer", required = true)
            @Valid @RequestBody ProjectLeaderCreateRequest request) {

        logAuthenticationDetails("createProjectLeader");
        log.debug("REST request to create Project Leader with email: {}", request.getEmail());
        ProjectLeaderProfileResponse result = projectLeaderService.createProjectLeader(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @Operation(
        summary = "Créer un RH Admin avec profil complet",
        description = "Crée un nouveau RH Admin avec son compte Keycloak et son profil spécialisé"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "RH Admin créé avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = RhAdminProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "Données invalides",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifié",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé (CEO requis)",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "409", description = "Email déjà utilisé",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "503", description = "Service d'authentification indisponible",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping("/rh-admins")
    @PreAuthorize("hasRole('CEO')")
    public ResponseEntity<RhAdminProfileResponse> createRhAdmin(
            @Parameter(description = "Données complètes du RH Admin à créer", required = true)
            @Valid @RequestBody RhAdminCreateRequest request) {

        logAuthenticationDetails("createRhAdmin");
        log.debug("REST request to create RH Admin with email: {}", request.getEmail());
        RhAdminProfileResponse result = rhAdminService.createRhAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // ===== GESTION RH ADMIN PAR KEYCLOAK ID =====

    /**
     * Récupère un RH Admin par son keycloakId
     */
    @Operation(summary = "Récupérer un RH Admin par keycloakId",
               description = "Récupère les détails d'un RH Admin spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "RH Admin trouvé"),
        @ApiResponse(responseCode = "404", description = "RH Admin non trouvé"),
        @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    @GetMapping("/rh-admins/{keycloakId}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<RhAdminProfileResponse> getRhAdminByKeycloakId(
            @Parameter(description = "keycloakId du RH Admin", required = true)
            @PathVariable String keycloakId) {

        log.debug("REST request to get RH Admin by keycloakId: {}", keycloakId);
        RhAdminProfileResponse response = rhAdminService.getRhAdminByKeycloakId(keycloakId);
        return ResponseEntity.ok(response);
    }

    // ===== GESTION GÉNÉRALE DES UTILISATEURS =====

    @Operation(summary = "List all users", description = "Gets a paginated list of users with optional filters")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User list retrieved",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Access denied",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'PROJECT_LEADER')")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @Parameter(description = "Search term (on local fields: phone, department)")
            @RequestParam(required = false) String query,

            @Parameter(description = "Filter by role (not directly implemented in this version)")
            @RequestParam(required = false) String role,

            @ParameterObject
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        logAuthenticationDetails("getAllUsers");
        log.debug("REST request to get all users, query: {}, role: {}, page: {}", query, role, pageable);
        Page<UserDTO> page = adminUserService.getAllUsers(query, role, pageable);
        return ResponseEntity.ok(page);
    }

    @Operation(summary = "Get a user by local ID", description = "Gets the complete details of a specific user by local ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Access denied",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'PROJECT_LEADER', 'CANDIDATE')")
    public ResponseEntity<UserDTO> getUser(
            @Parameter(description = "User's local ID", required = true)
            @PathVariable String id) {

        logAuthenticationDetails("getUser");
        log.debug("REST request to get user with ID: {}", id);
        UserDTO userDTO = adminUserService.getUserById(id);
        return ResponseEntity.ok(userDTO);
    }

    @Operation(summary = "Update a user", description = "Updates the basic information and local fields of a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid data",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Access denied",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "503", description = "Authentication service unavailable",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<UserDTO> updateUser(
            @Parameter(description = "User's local ID", required = true)
            @PathVariable String id,

            @Parameter(description = "Update data", required = true)
            @Valid @RequestBody UserUpdateRequest request) {

        logAuthenticationDetails("updateUser");
        log.debug("REST request to update user with ID: {}", id);
        UserDTO result = adminUserService.updateUser(id, request);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Delete a user", description = "Deletes a user from Keycloak and the local database")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "User deleted"),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Access denied (SUPER_ADMIN required)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "503", description = "Authentication service unavailable",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CEO')")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User's local ID", required = true)
            @PathVariable String id) {

        logAuthenticationDetails("deleteUser");
        log.debug("REST request to delete user with ID: {}", id);
        adminUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Enable/disable a user", description = "Modifies the 'enabled' status of a user in Keycloak")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status updated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Access denied",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "503", description = "Authentication service unavailable",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PatchMapping("/{id}/enable")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<UserDTO> updateUserStatus(
            @Parameter(description = "User's local ID", required = true)
            @PathVariable String id,

            @Parameter(description = "New status", required = true)
            @Valid @RequestBody StatusUpdateRequest request) {

        logAuthenticationDetails("updateUserStatus");
        log.debug("REST request to update user status for ID: {}, enabled: {}", id, request.isEnabled());
        UserDTO result = adminUserService.updateUserStatus(id, request.isEnabled());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Update user roles", description = "Replaces a user's existing roles in Keycloak with the provided ones")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Roles updated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid data (e.g., invalid role)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Access denied (SUPER_ADMIN required)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "503", description = "Authentication service unavailable",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PatchMapping("/{id}/roles")
    @PreAuthorize("hasRole('CEO')")
    public ResponseEntity<UserDTO> updateUserRoles(
            @Parameter(description = "User's local ID", required = true)
            @PathVariable String id,

            @Parameter(description = "New set of roles", required = true)
            @Valid @RequestBody RoleUpdateRequest request) {

        logAuthenticationDetails("updateUserRoles");
        log.debug("REST request to update roles for user with ID: {}, roles: {}", id, request.getRoles());
        UserDTO result = adminUserService.updateUserRoles(id, request);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Reset password (Admin)", description = "Allows an administrator to set a new password for a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Password reset successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid data (e.g., password mismatch)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Access denied",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "503", description = "Authentication service unavailable",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PatchMapping("/{id}/password")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<Void> changePassword(
            @Parameter(description = "User's local ID", required = true)
            @PathVariable String id,

            @Parameter(description = "New password details", required = true)
            @Valid @RequestBody PasswordChangeRequest request) {

        logAuthenticationDetails("changePassword");
        log.debug("REST request to change password for user with ID: {}", id);

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().build();
        }

        adminUserService.changePassword(id, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Synchronize Keycloak user",
        description = "Synchronise un utilisateur existant dans Keycloak avec le user-service. " +
                     "Crée l'entrée locale si elle n'existe pas. " +
                     "Accessible uniquement aux CEO et RH_ADMIN."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User synchronized successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "404", description = "User not found in Keycloak",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Access denied",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "503", description = "Authentication service unavailable",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping("/sync/{keycloakId}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public ResponseEntity<UserDTO> syncKeycloakUser(
            @Parameter(description = "ID Keycloak de l'utilisateur à synchroniser", required = true)
            @PathVariable String keycloakId) {

        logAuthenticationDetails("syncKeycloakUser");
        log.debug("REST request to sync Keycloak user with keycloakId: {}", keycloakId);
        UserDTO syncedUser = adminUserService.syncKeycloakUser(keycloakId);
        return ResponseEntity.ok(syncedUser);
    }

    /**
     * Utility method to log authentication details for debugging
     */
    private void logAuthenticationDetails(String method) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            log.debug("Auth context in {}: principal={}, authorities={}",
                    method,
                    auth.getName(),
                    auth.getAuthorities());
        } else {
            log.warn("No valid authentication found in security context for method {}", method);
        }
    }
}