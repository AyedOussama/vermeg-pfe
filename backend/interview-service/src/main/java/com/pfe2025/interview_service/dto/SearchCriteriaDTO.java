package com.pfe2025.interview_service.dto;

import com.pfe2025.interview_service.model.Interview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for search criteria.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchCriteriaDTO {
    private String candidateName;
    private String jobTitle;
    private String department;
    private List<Interview.InterviewStatus> statuses;
    private List<Interview.InterviewType> types;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String interviewer;
    private Boolean isRecommended;
    private Double minScore;
    private Double maxScore;
}