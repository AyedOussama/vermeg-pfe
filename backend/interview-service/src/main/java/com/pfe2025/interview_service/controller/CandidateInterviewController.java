package com.pfe2025.interview_service.controller;

import com.pfe2025.interview_service.dto.InterviewDTO;
import com.pfe2025.interview_service.dto.InterviewSlotDTO;
import com.pfe2025.interview_service.service.InterviewService;
import com.pfe2025.interview_service.service.SlotManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/candidates/interviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Candidate Interview", description = "APIs for candidates to manage their interviews")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateInterviewController {

    private final InterviewService interviewService;
    private final SlotManagementService slotManagementService;

    @GetMapping
    @Operation(summary = "Get my interviews", description = "Retrieve all interviews for the current candidate")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved interviews")
    public ResponseEntity<Page<InterviewDTO.CandidateView>> getMyInterviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "scheduledAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction.equals("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC, sort));

        Page<InterviewDTO.CandidateView> interviews = interviewService.getCandidateInterviews(pageRequest);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get interview details", description = "Get details of a specific interview")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved interview details")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<InterviewDTO.CandidateView> getInterviewDetails(@PathVariable Long id) {
        InterviewDTO.CandidateView interview = interviewService.getCandidateInterviewDetails(id);
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/{id}/slots")
    @Operation(summary = "Get available slots", description = "Get available time slots for an interview")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved slots")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<List<InterviewSlotDTO.SlotResponse>> getAvailableSlots(@PathVariable Long id) {
        List<InterviewSlotDTO.SlotResponse> slots = slotManagementService.getAvailableSlots(id);
        return ResponseEntity.ok(slots);
    }

    @PostMapping("/{id}/select-slot")
    @Operation(summary = "Select interview slot", description = "Select a time slot for an interview")
    @ApiResponse(responseCode = "200", description = "Slot selected successfully")
    @ApiResponse(responseCode = "404", description = "Interview or slot not found")
    @ApiResponse(responseCode = "400", description = "Invalid slot selection")
    public ResponseEntity<InterviewDTO.CandidateView> selectSlot(
            @PathVariable Long id,
            @RequestParam Long slotId) {

        InterviewDTO.CandidateView interview = slotManagementService.selectSlot(id, slotId);
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel interview", description = "Cancel an interview as a candidate")
    @ApiResponse(responseCode = "200", description = "Interview canceled successfully")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    @ApiResponse(responseCode = "400", description = "Cannot cancel interview")
    public ResponseEntity<InterviewDTO.CandidateView> cancelInterview(
            @PathVariable Long id,
            @RequestParam String reason) {

        InterviewDTO.CandidateView interview = interviewService.candidateCancelInterview(id, reason);
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{id}/reschedule-request")
    @Operation(summary = "Request reschedule", description = "Request to reschedule an interview")
    @ApiResponse(responseCode = "200", description = "Reschedule request submitted successfully")
    @ApiResponse(responseCode = "404", description = "Interview not found")
    public ResponseEntity<InterviewDTO.CandidateView> requestReschedule(
            @PathVariable Long id,
            @RequestParam String reason) {

        InterviewDTO.CandidateView interview = interviewService.requestReschedule(id, reason);
        return ResponseEntity.ok(interview);
    }
}