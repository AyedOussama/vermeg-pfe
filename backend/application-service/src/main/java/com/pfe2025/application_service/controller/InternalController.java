package com.pfe2025.application_service.controller;

import com.pfe2025.application_service.dto.ApplicationDTO;
import com.pfe2025.application_service.event.ApplicationSubmittedEvent;
import com.pfe2025.application_service.model.Application;
import com.pfe2025.application_service.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Internal API", description = "API for inter-microservice communication")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('INTERNAL_SERVICE')")
public class InternalController {

    private final ApplicationService applicationService;

    @PostMapping("/applications/submit")
    @Operation(summary = "Submit application", description = "Internal API to submit an application from another service")
    @ApiResponse(responseCode = "200", description = "Application created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid data")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<ApplicationDTO.CreateResponse> submitApplication(
            @RequestBody ApplicationSubmittedEvent event) {
        log.info("Internal REST request to submit application for candidate {} and job {}",
                event.getCandidateId(), event.getJobPostingId());

        ApplicationDTO.CreateResponse response = applicationService.processExternalSubmission(event);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/applications/job/{jobId}")
    @Operation(summary = "Applications by job", description = "Internal API to get applications for a job")
    @ApiResponse(responseCode = "200", description = "Applications retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<List<ApplicationDTO.SummaryResponse>> getApplicationsByJob(@PathVariable Long jobId) {
        log.info("Internal REST request to get applications for job {}", jobId);

        List<ApplicationDTO.SummaryResponse> applications = applicationService.getApplicationSummariesByJob(jobId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/candidate/{candidateId}")
    @Operation(summary = "Applications by candidate", description = "Internal API to get applications for a candidate")
    @ApiResponse(responseCode = "200", description = "Applications retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<List<ApplicationDTO.SummaryResponse>> getApplicationsByCandidate(
            @PathVariable String candidateId) {
        log.info("Internal REST request to get applications for candidate {}", candidateId);

        List<ApplicationDTO.SummaryResponse> applications =
                applicationService.getApplicationSummariesByCandidate(candidateId);

        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/{id}")
    @Operation(summary = "Application detail", description = "Internal API to get the details of an application")
    @ApiResponse(responseCode = "200", description = "Application retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<ApplicationDTO.DetailResponse> getApplicationDetails(@PathVariable Long id) {
        log.info("Internal REST request to get application details for {}", id);

        ApplicationDTO.DetailResponse application = applicationService.getApplicationDetails(id);
        return ResponseEntity.ok(application);
    }

    @PostMapping("/applications/{id}/status")
    @Operation(summary = "Update status", description = "Internal API to update the status of an application")
    @ApiResponse(responseCode = "200", description = "Status updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid status transition")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<ApplicationDTO.SummaryResponse> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        log.info("Internal REST request to update status for application {} to {}", id, status);

        ApplicationDTO.SummaryResponse response =
                applicationService.updateStatusFromExternalService(id, status, reason);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/applications/{id}/interview-status")
    @Operation(summary = "Update interview status", description = "Internal API to update the interview status of an application")
    @ApiResponse(responseCode = "200", description = "Interview status updated successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<ApplicationDTO.SummaryResponse> updateInterviewStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> interviewData) {
        log.info("Internal REST request to update interview status for application {}", id);

        Long interviewId = ((Number) interviewData.get("interviewId")).longValue();
        String interviewStatus = (String) interviewData.get("status");

        ApplicationDTO.SummaryResponse response =
                applicationService.updateInterviewStatus(id, interviewId, interviewStatus);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/metrics/job/{jobId}")
    @Operation(summary = "Job metrics", description = "Internal API to get metrics for a job")
    @ApiResponse(responseCode = "200", description = "Metrics retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<Map<String, Object>> getJobMetrics(@PathVariable Long jobId) {
        log.info("Internal REST request to get metrics for job {}", jobId);

        Map<String, Object> metrics = applicationService.getJobMetricsForInternalService(jobId);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/applications/{id}/status")
    @Operation(summary = "Current status", description = "Get current status of an application")
    @ApiResponse(responseCode = "200", description = "Status retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Application not found")
    public ResponseEntity<Application.ApplicationStatus> getCurrentStatus(@PathVariable Long id) {
        log.info("Internal REST request to get current status for application {}", id);

        Application.ApplicationStatus status = applicationService.getCurrentStatus(id);
        return ResponseEntity.ok(status);
    }
}