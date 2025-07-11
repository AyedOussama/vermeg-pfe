package com.pfe2025.interview_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event received when an application status changes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusChangedEvent {
    private Long applicationId;
    private String previousStatus;
    private String newStatus;
    private LocalDateTime changedAt;
}