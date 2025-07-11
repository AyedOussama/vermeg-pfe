package com.pfe2025.application_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationMetricsEvent {
    private Long jobPostingId;
    private String reference;
    private String candidateId;
    private String candidateName;
    private String jobTitle;
    private String jobDepartment;
    private LocalDateTime submittedAt;
}