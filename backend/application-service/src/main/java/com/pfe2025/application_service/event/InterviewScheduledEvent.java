package com.pfe2025.application_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Événement reçu lorsqu'un entretien a été planifié.
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