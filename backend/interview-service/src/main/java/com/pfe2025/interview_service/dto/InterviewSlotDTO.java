package com.pfe2025.interview_service.dto;

import com.pfe2025.interview_service.model.InterviewSlot;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for Interview Slot operations.
 */
public class InterviewSlotDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull
        @Future
        private LocalDateTime startDateTime;

        @NotNull
        @Future
        private LocalDateTime endDateTime;

        @NotNull
        private InterviewSlot.SlotFormat format;

        private String location;
        private String meetingLink;
        private List<String> participantIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlotResponse {
        private Long id;
        private LocalDateTime startDateTime;
        private LocalDateTime endDateTime;
        private InterviewSlot.SlotFormat slotFormat;
        private String location;
        private String meetingLink;
        private InterviewSlot.SlotStatus slotStatus;
        private String googleCalendarEventId;
        private List<String> participantNames;
        private Boolean isSelected;
        private String cancellationReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateSlotRequest {
        private LocalDateTime startDateTime;
        private LocalDateTime endDateTime;
        private InterviewSlot.SlotFormat format;
        private String location;
        private String meetingLink;
    }
}