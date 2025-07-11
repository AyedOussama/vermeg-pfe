package com.pfe2025.interview_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event emitted when an interview has been scheduled.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewScheduledEvent {
    private Long interviewId;
    private Long applicationId;
    private String applicationReference;
    private String candidateId;
    private LocalDateTime interviewDateTime;
    private String interviewFormat;
    private String location;
    private LocalDateTime scheduledAt;
}