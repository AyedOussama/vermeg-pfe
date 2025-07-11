package com.pfe2025.interview_service.dto;

import com.pfe2025.interview_service.model.InterviewParticipant;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTOs for Interview Participant operations.
 */
public class ParticipantDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddParticipantRequest {
        @NotNull
        private String userId;

        @NotNull
        @Email
        private String userEmail;

        @NotNull
        private String userName;

        @NotNull
        private InterviewParticipant.ParticipantRole role;

        private Boolean isRequired;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantResponse {
        private Long id;
        private String userId;
        private String userEmail;
        private String userName;
        private InterviewParticipant.ParticipantRole participantRole;
        private InterviewParticipant.ParticipantStatus participantStatus;
        private Boolean isOrganizer;
        private Boolean isRequired;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateParticipantRequest {
        private InterviewParticipant.ParticipantStatus status;
        private String notes;
    }
}