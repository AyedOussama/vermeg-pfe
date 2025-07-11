package com.pfe2025.application_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPostingDTO {
    private Long id;
    private String title;
    private String description;
    private String department;
    private String location;
    private String employmentType; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
    private String experienceLevel; // ENTRY, MID, SENIOR, EXECUTIVE
    private Integer minYearsExperience;
    private List<String> requiredSkills;
    private List<String> preferredSkills;
    private String responsibilities;
    private String qualifications;
    private String benefits;
    private String applicationInstructions;
    private String status; // DRAFT, PUBLISHED, CLOSED, ARCHIVED
    private Integer numberOfOpenings;
    private Integer numberOfApplications;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime publishedAt;
    private LocalDateTime closingAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, Object> additionalMetadata;
}