package com.pfe2025.interview_service.controller;

import com.pfe2025.interview_service.dto.FeedbackDTO;
import com.pfe2025.interview_service.dto.InterviewDTO;
import com.pfe2025.interview_service.dto.InterviewSlotDTO;
import com.pfe2025.interview_service.dto.SearchCriteriaDTO;
import com.pfe2025.interview_service.service.FeedbackService;
import com.pfe2025.interview_service.service.InterviewService;
import com.pfe2025.interview_service.service.SlotManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/interviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Interview Management", description = "APIs for HR administrators to manage interviews")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('RH_ADMIN')")
public class AdminInterviewController {

    private final InterviewService interviewService;
    private final SlotManagementService slotManagementService;
    private final FeedbackService feedbackService;

    @GetMapping
    @Operation(summary = "Get all interviews", description = "Retrieve all interviews with pagination and filtering")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved interviews")
    public ResponseEntity<Page<InterviewDTO.SummaryResponse>> getAllInterviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "scheduledAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction.equals("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC, sort));

        Page<InterviewDTO.SummaryResponse> interviews = interviewService.getAllInterviews(pageRequest);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get interview details", description = "Retrieve detailed information about a specific interview")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved interview details")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<InterviewDTO.DetailResponse> getInterviewDetails(@PathVariable Long id) {
        InterviewDTO.DetailResponse interview = interviewService.getInterviewDetails(id);
        return ResponseEntity.ok(interview);
    }

    @PostMapping
    @Operation(summary = "Create interview", description = "Create a new interview for an application")
    @ApiResponse(responseCode = "201", description = "Interview created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<InterviewDTO.DetailResponse> createInterview(
            @Valid @RequestBody InterviewDTO.CreateRequest request) {

        InterviewDTO.DetailResponse interview = interviewService.createInterview(request);
        return ResponseEntity.status(201).body(interview);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update interview", description = "Update interview details")
    @ApiResponse(responseCode = "200", description = "Interview updated successfully")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<InterviewDTO.DetailResponse> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody InterviewDTO.UpdateRequest request) {

        InterviewDTO.DetailResponse interview = interviewService.updateInterview(id, request);
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel interview", description = "Cancel an interview")
    @ApiResponse(responseCode = "200", description = "Interview canceled successfully")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<InterviewDTO.DetailResponse> cancelInterview(
            @PathVariable Long id,
            @RequestParam String reason) {

        InterviewDTO.DetailResponse interview = interviewService.cancelInterview(id, reason);
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{id}/slots")
    @Operation(summary = "Propose interview slots", description = "Propose available time slots for an interview")
    @ApiResponse(responseCode = "200", description = "Slots proposed successfully")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<List<InterviewSlotDTO.SlotResponse>> proposeSlots(
            @PathVariable Long id,
            @Valid @RequestBody List<InterviewSlotDTO.CreateRequest> slots) {

        List<InterviewSlotDTO.SlotResponse> proposedSlots = slotManagementService.proposeSlots(id, slots);
        return ResponseEntity.ok(proposedSlots);
    }

    @GetMapping("/{id}/slots")
    @Operation(summary = "Get interview slots", description = "Retrieve all time slots for an interview")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved slots")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<List<InterviewSlotDTO.SlotResponse>> getInterviewSlots(@PathVariable Long id) {
        List<InterviewSlotDTO.SlotResponse> slots = slotManagementService.getInterviewSlots(id);
        return ResponseEntity.ok(slots);
    }

    @PostMapping("/{id}/feedback")
    @Operation(summary = "Submit feedback", description = "Submit feedback for an interview")
    @ApiResponse(responseCode = "200", description = "Feedback submitted successfully")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<FeedbackDTO.FeedbackResponse> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackDTO.SubmitFeedbackRequest request) {

        FeedbackDTO.FeedbackResponse feedback = feedbackService.submitFeedback(id, request);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/{id}/feedback")
    @Operation(summary = "Get interview feedback", description = "Retrieve all feedback for an interview")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved feedback")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<List<FeedbackDTO.FeedbackResponse>> getInterviewFeedback(@PathVariable Long id) {
        List<FeedbackDTO.FeedbackResponse> feedbacks = feedbackService.getInterviewFeedback(id);
        return ResponseEntity.ok(feedbacks);
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete interview", description = "Mark an interview as completed")
    @ApiResponse(responseCode = "200", description = "Interview completed successfully")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<InterviewDTO.DetailResponse> completeInterview(@PathVariable Long id) {
        InterviewDTO.DetailResponse interview = interviewService.completeInterview(id);
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/search")
    @Operation(summary = "Search interviews", description = "Search interviews with criteria")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved search results")
    public ResponseEntity<Page<InterviewDTO.SummaryResponse>> searchInterviews(
            @Valid SearchCriteriaDTO criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "scheduledAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction.equals("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC, sort));

        Page<InterviewDTO.SummaryResponse> interviews = interviewService.searchInterviews(criteria, pageRequest);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get interview statistics", description = "Get overall interview statistics")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics")
    public ResponseEntity<InterviewDTO.InterviewStats> getInterviewStats() {
        InterviewDTO.InterviewStats stats = interviewService.getInterviewStatistics();
        return ResponseEntity.ok(stats);
    }
}