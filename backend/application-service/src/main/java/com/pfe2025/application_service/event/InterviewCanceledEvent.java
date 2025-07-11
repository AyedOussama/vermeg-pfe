package com.pfe2025.application_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Événement reçu lorsqu'un entretien est annulé.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewCanceledEvent {
    private Long interviewId;
    private Long applicationId;
    private String applicationReference;
    private String reason;
    private String canceledBy; // CANDIDATE, HR, SYSTEM
    private LocalDateTime canceledAt;
}