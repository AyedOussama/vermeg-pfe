package com.pfe2025.interview_service.controller;

import com.pfe2025.interview_service.dto.InterviewDTO;
import com.pfe2025.interview_service.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Internal API for communication with other microservices.
 */
@RestController
@RequestMapping("/api/internal/interviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Internal Interview API", description = "Internal APIs for microservice communication")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('INTERNAL_SERVICE')")
public class InternalInterviewController {

    private final InterviewService interviewService;

    @GetMapping("/{id}")
    @Operation(summary = "Get interview by ID", description = "Internal API to get interview details")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved interview")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<InterviewDTO.InternalResponse> getInterviewById(@PathVariable Long id) {
        InterviewDTO.InternalResponse interview = interviewService.getInterviewForInternal(id);
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Get interview by application", description = "Get interview details for a specific application")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved interview")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<InterviewDTO.InternalResponse> getInterviewByApplication(@PathVariable Long applicationId) {
        InterviewDTO.InternalResponse interview = interviewService.getInterviewByApplication(applicationId);
        return ResponseEntity.ok(interview);
    }

    @PostMapping
    @Operation(summary = "Create interview", description = "Internal API to create an interview")
    @ApiResponse(responseCode = "201", description = "Interview created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<InterviewDTO.InternalResponse> createInterviewFromApplication(
            @RequestBody InterviewDTO.InternalCreateRequest request) {

        InterviewDTO.InternalResponse interview = interviewService.createInterviewFromApplication(request);
        return ResponseEntity.status(201).body(interview);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update interview status", description = "Update interview status from another service")
    @ApiResponse(responseCode = "200", description = "Status updated successfully")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<InterviewDTO.InternalResponse> updateInterviewStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        InterviewDTO.InternalResponse interview = interviewService.updateInterviewStatusFromExternal(id, status);
        return ResponseEntity.ok(interview);
    }
}