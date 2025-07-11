package com.pfe2025.application_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Événement émis lorsqu'un entretien est demandé pour une candidature.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRequestedEvent {
    private Long applicationId;
    private String applicationReference;
    private String candidateId;
    private String candidateName;
    private Long jobPostingId;
    private String jobTitle;
    private String jobDepartment;
    private String requesterUsername;
    private LocalDateTime requestedAt;
}