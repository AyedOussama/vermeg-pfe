package com.pfe2025.application_service.controller;

import com.pfe2025.application_service.dto.ApplicationDTO;
import com.pfe2025.application_service.dto.PageResponseDTO;
import com.pfe2025.application_service.dto.SearchCriteriaDTO;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/applications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Application Administration", description = "API for application administration by HR")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('RH_ADMIN')")
public class AdminApplicationController {

    private final ApplicationService applicationService;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard", description = "Get intelligent dashboard data")
    @ApiResponse(responseCode = "200", description = "Data retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<ApplicationDTO.DashboardSummary> getDashboardData() {
        log.info("REST request to get dashboard data");

        ApplicationDTO.DashboardSummary dashboardData = applicationService.getDashboardData();
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping
    @Operation(summary = "Search applications", description = "Search applications with pagination and filtering")
    @ApiResponse(responseCode = "200", description = "Search completed successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<PageResponseDTO<ApplicationDTO.SummaryResponse>> searchApplications(
            @Parameter(description = "Search criteria") SearchCriteriaDTO criteria,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "submittedAt") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String direction) {
        log.info("REST request to search applications with criteria: {}", criteria);

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        PageResponseDTO<ApplicationDTO.SummaryResponse> response =
                applicationService.searchApplications(criteria, pageRequest);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Application detail", description = "Get complete details of an application")
    @ApiResponse(responseCode = "200", description = "Application retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<ApplicationDTO.DetailResponse> getApplicationDetails(@PathVariable Long id) {
        log.info("REST request to get application details for {}", id);

        ApplicationDTO.DetailResponse application = applicationService.getApplicationDetails(id);
        return ResponseEntity.ok(application);
    }

    @PostMapping("/{id}/decision")
    @Operation(summary = "Make decision", description = "Make a decision on an application")
    @ApiResponse(responseCode = "200", description = "Decision recorded successfully")
    @ApiResponse(responseCode = "400", description = "Invalid decision")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<ApplicationDTO.DetailResponse> makeDecision(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationDTO.DecisionRequest request) {
        log.info("REST request to make decision for application {}: {}", id, request.getNewStatus());

        String userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        ApplicationDTO.DetailResponse application =
                applicationService.processDecision(id, userId, request);

        return ResponseEntity.ok(application);
    }

    @PostMapping("/{id}/request-interview")
    @Operation(summary = "Request interview", description = "Request an interview for a shortlisted application")
    @ApiResponse(responseCode = "200", description = "Interview request initiated successfully")
    @ApiResponse(responseCode = "400", description = "Application in a state that doesn't allow interview requests")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<ApplicationDTO.DetailResponse> requestInterview(@PathVariable Long id) {
        log.info("REST request to request interview for application {}", id);

        String userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        ApplicationDTO.DetailResponse application = applicationService.requestInterview(id, userId);

        return ResponseEntity.ok(application);
    }

    @GetMapping("/job/{jobId}")
    @Operation(summary = "Applications by job", description = "Get applications for a specific job posting")
    @ApiResponse(responseCode = "200", description = "Applications retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<PageResponseDTO<ApplicationDTO.SummaryResponse>> getApplicationsByJob(
            @PathVariable Long jobId,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "submittedAt") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String direction) {
        log.info("REST request to get applications for job {}", jobId);

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        PageResponseDTO<ApplicationDTO.SummaryResponse> applications =
                applicationService.getApplicationsByJobPosting(jobId, pageRequest);

        return ResponseEntity.ok(applications);
    }

    @GetMapping("/stats/{jobId}")
    @Operation(summary = "Job statistics", description = "Get application statistics for a job")
    @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<ApplicationDTO.JobPostingStatsDTO> getJobPostingStats(@PathVariable Long jobId) {
        log.info("REST request to get application stats for job {}", jobId);

        ApplicationDTO.JobPostingStatsDTO stats = applicationService.getJobPostingStats(jobId);
        return ResponseEntity.ok(stats);
    }
}