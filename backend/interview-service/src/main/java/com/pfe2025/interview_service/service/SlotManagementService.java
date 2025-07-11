package com.pfe2025.interview_service.service;

import com.pfe2025.interview_service.dto.InterviewDTO;
import com.pfe2025.interview_service.dto.InterviewSlotDTO;
import com.pfe2025.interview_service.event.InterviewScheduledEvent;
import com.pfe2025.interview_service.exception.InvalidOperationException;
import com.pfe2025.interview_service.exception.ResourceNotFoundException;
import com.pfe2025.interview_service.mapper.InterviewSlotMapper;
import com.pfe2025.interview_service.model.Interview;
import com.pfe2025.interview_service.model.InterviewSlot;
import com.pfe2025.interview_service.repository.InterviewRepository;
import com.pfe2025.interview_service.repository.InterviewSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing interview slots.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SlotManagementService {

    private final InterviewRepository interviewRepository;
    private final InterviewSlotRepository slotRepository;
    private final InterviewSlotMapper slotMapper;
    private final GoogleCalendarService googleCalendarService;
    private final StreamBridge streamBridge;

    @Transactional
    public List<InterviewSlotDTO.SlotResponse> proposeSlots(Long interviewId,
                                                            List<InterviewSlotDTO.CreateRequest> slotRequests) {
        log.debug("Proposing slots for interview: {}", interviewId);

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (interview.getStatus() != Interview.InterviewStatus.REQUESTED) {
            throw new InvalidOperationException("Can only propose slots for requested interviews");
        }

        // Create slots
        List<InterviewSlot> slots = slotRequests.stream()
                .map(request -> {
                    InterviewSlot slot = slotMapper.fromRequest(request);
                    slot.setInterview(interview);
                    slot.setStatus(InterviewSlot.SlotStatus.PROPOSED);

                    // Create provisional calendar event
                    try {
                        String eventId = googleCalendarService.createProvisionalEvent(interview, slot);
                        slot.setGoogleCalendarEventId(eventId);
                    } catch (Exception e) {
                        log.error("Failed to create calendar event: {}", e.getMessage());
                    }

                    return slot;
                })
                .collect(Collectors.toList());

        slots = slotRepository.saveAll(slots);

        // Update interview status
        interview.setStatus(Interview.InterviewStatus.SLOTS_PROPOSED);
        interviewRepository.save(interview);

        return slots.stream()
                .map(slotMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InterviewDTO.CandidateView selectSlot(Long interviewId, Long slotId) {
        log.debug("Selecting slot {} for interview {}", slotId, interviewId);

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        InterviewSlot selectedSlot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!selectedSlot.getInterview().getId().equals(interviewId)) {
            throw new InvalidOperationException("Slot does not belong to this interview");
        }

        if (selectedSlot.getStatus() != InterviewSlot.SlotStatus.PROPOSED) {
            throw new InvalidOperationException("Slot is not available for selection");
        }

        // Mark slot as selected
        selectedSlot.setStatus(InterviewSlot.SlotStatus.SELECTED);
        slotRepository.save(selectedSlot);

        // Cancel other slots
        List<InterviewSlot> otherSlots = slotRepository.findByInterviewIdAndStatus(
                interviewId, InterviewSlot.SlotStatus.PROPOSED);

        for (InterviewSlot slot : otherSlots) {
            if (!slot.getId().equals(slotId)) {
                slot.setStatus(InterviewSlot.SlotStatus.DECLINED);

                // Cancel calendar event
                if (slot.getGoogleCalendarEventId() != null) {
                    try {
                        googleCalendarService.cancelCalendarEvent(slot.getGoogleCalendarEventId(),
                                interview.getCandidateId());
                    } catch (Exception e) {
                        log.error("Failed to cancel calendar event: {}", e.getMessage());
                    }
                }
            }
        }
        slotRepository.saveAll(otherSlots);

        // Update interview
        interview.setStatus(Interview.InterviewStatus.SLOT_SELECTED);
        interview.setSelectedSlotId(slotId);
        interview.setScheduledAt(selectedSlot.getStartDateTime());
        interview.setFormat(selectedSlot.getFormat().name());
        interview.setLocation(selectedSlot.getLocation());
        interview.setMeetingLink(selectedSlot.getMeetingLink());
        interview = interviewRepository.save(interview);

        // Confirm calendar event
        if (selectedSlot.getGoogleCalendarEventId() != null) {
            try {
                googleCalendarService.confirmCalendarEvent(selectedSlot.getGoogleCalendarEventId());
            } catch (Exception e) {
                log.error("Failed to confirm calendar event: {}", e.getMessage());
            }
        }

        // Publish event
        InterviewScheduledEvent event = InterviewScheduledEvent.builder()
                .interviewId(interview.getId())
                .applicationId(interview.getApplicationId())
                .applicationReference(interview.getApplicationReference())
                .candidateId(interview.getCandidateId())
                .interviewDateTime(selectedSlot.getStartDateTime())
                .interviewFormat(selectedSlot.getFormat().name())
                .location(selectedSlot.getLocation())
                .scheduledAt(LocalDateTime.now())
                .build();

        streamBridge.send("interviewScheduledSupplier-out-0", event);

        // Convert to candidate view
        return InterviewDTO.CandidateView.builder()
                .id(interview.getId())
                .applicationReference(interview.getApplicationReference())
                .jobTitle(interview.getJobTitle())
                .currentStatus(interview.getStatus())
                .type(interview.getType())
                .scheduleDate(interview.getScheduledAt())
                .format(interview.getFormat())
                .location(interview.getLocation())
                .meetingLink(interview.getMeetingLink())
                .build();
    }

    @Transactional(readOnly = true)
    public List<InterviewSlotDTO.SlotResponse> getInterviewSlots(Long interviewId) {
        List<InterviewSlot> slots = slotRepository.findByInterviewId(interviewId);
        return slots.stream()
                .map(slotMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewSlotDTO.SlotResponse> getAvailableSlots(Long interviewId) {
        List<InterviewSlot> slots = slotRepository.findByInterviewIdAndStatus(
                interviewId, InterviewSlot.SlotStatus.PROPOSED);

        return slots.stream()
                .filter(slot -> slot.getStartDateTime().isAfter(LocalDateTime.now()))
                .map(slotMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelAllSlots(Long interviewId, String reason) {
        List<InterviewSlot> slots = slotRepository.findByInterviewId(interviewId);

        for (InterviewSlot slot : slots) {
            slot.setStatus(InterviewSlot.SlotStatus.CANCELED);
            slot.setCancellationReason(reason);
            slot.setCanceledAt(LocalDateTime.now());

            if (slot.getGoogleCalendarEventId() != null) {
                try {
                    googleCalendarService.cancelCalendarEvent(slot.getGoogleCalendarEventId(), "HR");
                } catch (Exception e) {
                    log.error("Failed to cancel calendar event: {}", e.getMessage());
                }
            }
        }

        slotRepository.saveAll(slots);
    }

    @Scheduled(cron = "${app.scheduler.slot-expiration-cron}")
    @Transactional
    public void expireOldSlots() {
        log.debug("Checking for expired slots");

        LocalDateTime expiry = LocalDateTime.now().minusHours(1);
        List<InterviewSlot> expiredSlots = slotRepository.findExpiredSlots(
                InterviewSlot.SlotStatus.PROPOSED, expiry);

        for (InterviewSlot slot : expiredSlots) {
            if (slot.getStartDateTime().isBefore(LocalDateTime.now())) {
                slot.setStatus(InterviewSlot.SlotStatus.EXPIRED);

                if (slot.getGoogleCalendarEventId() != null) {
                    try {
                        googleCalendarService.cancelCalendarEvent(slot.getGoogleCalendarEventId(), "SYSTEM");
                    } catch (Exception e) {
                        log.error("Failed to cancel expired calendar event: {}", e.getMessage());
                    }
                }
            }
        }

        slotRepository.saveAll(expiredSlots);
        log.info("Expired {} old interview slots", expiredSlots.size());
    }
}