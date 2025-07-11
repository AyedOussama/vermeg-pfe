package com.pfe2025.application_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO pour les détails d'un entretien.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InterviewDetailDTO {
    private Long id;
    private Long applicationId;
    private String applicationReference;
    private String status;
    private String candidateName;
    private String jobTitle;
    private LocalDateTime scheduledAt;
    private String format;
    private String location;
    private List<ParticipantDTO> participants;
    private Double overallScore;
    private String feedback;
    private Boolean isRecommended;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * DTO pour les participants à un entretien.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantDTO {
        private String name;
        private String email;
        private String role;
    }
}