package com.pfe2025.interview_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event emitted when an interview is requested for an application.
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