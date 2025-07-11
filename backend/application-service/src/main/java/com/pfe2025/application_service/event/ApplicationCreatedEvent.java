package com.pfe2025.application_service.event;

import com.pfe2025.application_service.model.Application.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Événement émis lors de la création d'une candidature.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationCreatedEvent {
    private Long applicationId;
    private String reference;
    private String candidateId;
    private Long jobPostingId;
    private ApplicationStatus status;
    private LocalDateTime createdAt;
    private String candidateName;
    private String jobTitle;
}
