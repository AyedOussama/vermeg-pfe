package com.PFE2025.user_service.controller;

import com.PFE2025.user_service.dto.request.CandidateRegistrationRequest;
import com.PFE2025.user_service.dto.request.PasswordChangeRequest;
import com.PFE2025.user_service.dto.response.ApiError;
import com.PFE2025.user_service.dto.response.UserRegistrationResponse;
import com.PFE2025.user_service.service.CandidateService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Candidate Operations", description = "APIs for candidate registration and account management")
public class CandidateController {

    private final CandidateService candidateUserService;

    @Operation(
        summary = "Register a new candidate with CV upload",
        description = "Allows a new candidate to create an account with automatic CV upload. " +
                     "Process: 1) Create Keycloak account, 2) Upload CV, 3) Create complete profile."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Candidate registered successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserRegistrationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid data or CV file",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "Email or username already in use",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "503", description = "Authentication or document service unavailable",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserRegistrationResponse> registerCandidate(
            @Parameter(description = "Candidate first name", required = true)
            @RequestParam("firstName") @NotBlank String firstName,

            @Parameter(description = "Candidate last name", required = true)
            @RequestParam("lastName") @NotBlank String lastName,

            @Parameter(description = "Email address", required = true)
            @RequestParam("email") @Email @NotBlank String email,

            @Parameter(description = "Password", required = true)
            @RequestParam("password") @NotBlank String password,

            @Parameter(description = "Phone number", required = true)
            @RequestParam("phone") @NotBlank String phone,

            @Parameter(description = "Location/City", required = true)
            @RequestParam("location") @NotBlank String location,

            @Parameter(description = "LinkedIn profile URL")
            @RequestParam(value = "linkedinUrl", required = false) String linkedinUrl,

            @Parameter(description = "Portfolio website URL")
            @RequestParam(value = "portfolioUrl", required = false) String portfolioUrl,

            @Parameter(description = "Date of birth (YYYY-MM-DD)", required = true)
            @RequestParam("dateOfBirth") @NotBlank String dateOfBirth,

            @Parameter(description = "Preferred job categories (comma-separated)", required = true)
            @RequestParam("preferredCategories") @NotBlank String preferredCategoriesStr,

            @Parameter(description = "CV file (PDF only, max 10MB)", required = true)
            @RequestParam("cvFile") @NotNull MultipartFile cvFile) {

        log.info("🚀 REST REQUEST - Inscription candidat: {} avec CV: {}", email, cvFile.getOriginalFilename());

        // Construire l'objet CandidateRegistrationRequest depuis les paramètres
        List<String> preferredCategories = List.of(preferredCategoriesStr.split(","))
                .stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toList());

        CandidateRegistrationRequest request = CandidateRegistrationRequest.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(password)
                .phone(phone)
                .location(location)
                .linkedinUrl(linkedinUrl)
                .portfolioUrl(portfolioUrl)
                .dateOfBirth(dateOfBirth)
                .preferredCategories(preferredCategories)
                .cvFile(cvFile)
                .build();

        UserRegistrationResponse result = candidateUserService.registerCandidate(request);
        log.info("✅ INSCRIPTION RÉUSSIE - Candidat: {} avec keycloakId: {}", email, result.getKeycloakId());

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }




    @Operation(summary = "Change candidate password", description = "Allows a logged-in candidate to change their own password")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Password changed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid data (e.g., password mismatch, incorrect current password)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "503", description = "Authentication service unavailable",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class)))
    })
    @PatchMapping("/password")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<Void> changePassword(
            @Parameter(description = "Password change details", required = true)
            @Valid @RequestBody PasswordChangeRequest request,

            @Parameter(hidden = true) Authentication authentication) {

        String username = authentication.getName();
        log.debug("REST request to change password for authenticated candidate: {}", username);

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().build();
        }

        candidateUserService.changePassword(username, request);
        return ResponseEntity.noContent().build();
    }
}