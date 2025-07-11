package com.pfe2025.application_service.controller;

import com.pfe2025.application_service.dto.*;
import com.pfe2025.application_service.exception.InvalidOperationException;
import com.pfe2025.application_service.service.ApplicationService;
import com.pfe2025.application_service.util.SecurityUtils;
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
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Candidate Applications", description = "API for candidates to manage their applications")
@SecurityRequirement(name = "bearerAuth")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Submit application", description = "Allows a candidate to submit an application for a job posting")
    @ApiResponse(responseCode = "201", description = "Application created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid data")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "409", description = "An application already exists for this job")
    public ResponseEntity<ApplicationDTO.CreateResponse> submitApplication(
            @Valid @RequestBody ApplicationDTO.CreateRequest request) {
        log.info("REST request to submit application for job {}", request.getJobPostingId());

        String candidateId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        // Validation: Check if resume exists
        if (request.getResumeDocumentId() == null) {
            throw new InvalidOperationException("A resume is required to submit an application");
        }

        ApplicationDTO.CreateResponse response = applicationService.createApplication(candidateId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get my applications", description = "Retrieves the list of applications for the current user")
    @ApiResponse(responseCode = "200", description = "Applications list retrieved")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<PageResponseDTO<ApplicationDTO.CandidateView>> getMyApplications(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "submittedAt") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String direction) {
        log.info("REST request to get applications for current candidate");

        String candidateId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        PageResponseDTO<ApplicationDTO.CandidateView> applications =
                applicationService.getApplicationsForCandidate(candidateId, pageRequest);

        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get application", description = "Retrieves the details of an application")
    @ApiResponse(responseCode = "200", description = "Application retrieved")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<ApplicationDTO.CandidateView> getApplication(@PathVariable Long id) {
        log.info("REST request to get application {}", id);

        String candidateId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        ApplicationDTO.CandidateView application = applicationService.getApplicationForCandidate(candidateId, id);
        return ResponseEntity.ok(application);
    }

    @PutMapping("/applications/{id}/withdraw")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Withdraw application", description = "Allows the candidate to withdraw their application")
    @ApiResponse(responseCode = "200", description = "Application withdrawn successfully")
    @ApiResponse(responseCode = "400", description = "Invalid operation (application cannot be withdrawn)")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<ApplicationDTO.CandidateView> withdrawApplication(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationDTO.WithdrawRequest request) {
        log.info("REST request to withdraw application {}", id);

        String candidateId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        ApplicationDTO.CandidateView application =
                applicationService.withdrawApplication(candidateId, id, request.getReason());

        return ResponseEntity.ok(application);
    }

    @PostMapping("/applications/{id}/cover-letter")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Add cover letter", description = "Adds a cover letter to an application")
    @ApiResponse(responseCode = "200", description = "Cover letter added successfully")
    @ApiResponse(responseCode = "400", description = "Invalid operation")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<List<DocumentDTO>> addCoverLetterToApplication(
            @PathVariable Long id,
            @Valid @RequestBody Long documentId) {
        log.info("REST request to add cover letter {} to application {}", documentId, id);

        String candidateId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        List<DocumentDTO> documents = applicationService.addDocumentToApplication(candidateId, id, documentId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/applications/{id}/status-history")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Status history", description = "Retrieves the status change history of an application")
    @ApiResponse(responseCode = "200", description = "History retrieved")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<List<StatusHistoryDTO>> getStatusHistory(@PathVariable Long id) {
        log.info("REST request to get status history for application {}", id);

        String candidateId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        List<StatusHistoryDTO> history = applicationService.getStatusHistoryForCandidate(candidateId, id);
        return ResponseEntity.ok(history);
    }
}