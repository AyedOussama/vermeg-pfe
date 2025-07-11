package com.pfe2025.application_service.dto;

import com.pfe2025.application_service.model.Application.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO pour les critères de recherche.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchCriteriaDTO {
    private String keyword;
    private Long jobPostingId;
    private String jobTitle;
    private String department;
    private Set<ApplicationStatus> statuses;
    private Double minAiScore;
    private Double maxAiScore;
    private Boolean aiProcessed;
    private Boolean autoDecision;
    private LocalDateTime submittedAfter;
    private LocalDateTime submittedBefore;
    private String candidateId;
    private String candidateName;
    private String reference;
}