package com.pfe2025.jobpostingservice.mapper;

import com.pfe2025.jobpostingservice.dto.JobPostDTO;

import com.pfe2025.jobpostingservice.event.RequisitionApprovedEvent;
import com.pfe2025.jobpostingservice.model.JobPost;
import com.pfe2025.jobpostingservice.model.enums.EmploymentType;
import com.pfe2025.jobpostingservice.model.enums.PostingStatus;
import org.mapstruct.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Mapper pour la conversion entre entités JobPost et DTOs.
 */
@Mapper(componentModel = "spring",
        uses = {JobPostingSkillMapper.class, PostingMetricsMapper.class},
        imports = {LocalDateTime.class, PostingStatus.class, EmploymentType.class})
public interface JobPostMapper {

    @Mapping(target = "skills", source = "skills")
    @Mapping(target = "metrics", source = "metrics")
    JobPostDTO.Response toResponseDto(JobPost jobPost);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "department", source = "department")
    @Mapping(target = "location", source = "location")
    @Mapping(target = "employmentType", source = "employmentType")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "publishedAt", source = "publishedAt")
    @Mapping(target = "applicationCount", source = "metrics.totalApplicationCount")
    JobPostDTO.Summary toSummaryDto(JobPost jobPost);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "department", source = "department")
    @Mapping(target = "location", source = "location")
    @Mapping(target = "employmentType", source = "employmentType")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "responsibilities", source = "responsibilities")
    @Mapping(target = "qualifications", source = "qualifications")
    @Mapping(target = "benefits", source = "benefits")
    @Mapping(target = "minExperience", source = "minExperience")
    @Mapping(target = "publishedAt", source = "publishedAt")
    @Mapping(target = "skills", source = "skills")
    @Mapping(target = "salaryRange", expression = "java(formatSalaryRange(jobPost))")
    JobPostDTO.PublicView toPublicViewDto(JobPost jobPost);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "lastModifiedAt", ignore = true)
    @Mapping(target = "activityLog", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "metrics", ignore = true)
    JobPost toEntity(JobPostDTO.Request dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "requisitionId", source = "requisitionId")
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdBy", source = "approvedBy")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "lastModifiedAt", ignore = true)
    @Mapping(target = "activityLog", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "metrics", ignore = true)
    @Mapping(target = "skills", ignore = true)
    @Mapping(target = "employmentType", expression = "java(convertEmploymentType(event.getRequiredLevel()))")
    JobPost fromRequisitionEvent(RequisitionApprovedEvent event);

    /**
     * Met à jour une entité existante à partir d'un DTO.
     *
     * @param dto Le DTO source
     * @param jobPost L'entité à mettre à jour
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "closedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "skills", ignore = true)
    @Mapping(target = "activityLog", ignore = true)
    @Mapping(target = "metrics", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateFromDto(JobPostDTO.Request dto, @MappingTarget JobPost jobPost);

    List<JobPostDTO.Response> toResponseDtoList(List<JobPost> jobPosts);

    List<JobPostDTO.Summary> toSummaryDtoList(List<JobPost> jobPosts);

    List<JobPostDTO.PublicView> toPublicViewDtoList(List<JobPost> jobPosts);

    /**
     * Formate la plage salariale pour l'affichage public.
     */
    default String formatSalaryRange(JobPost jobPost) {
        if (jobPost.getDisplaySalary() != null && jobPost.getDisplaySalary()) {
            if (jobPost.getSalaryRangeMin() != null && jobPost.getSalaryRangeMax() != null) {
                return String.format("%s € - %s €",
                        jobPost.getSalaryRangeMin().toString(),
                        jobPost.getSalaryRangeMax().toString());
            } else if (jobPost.getSalaryRangeMin() != null) {
                return String.format("À partir de %s €", jobPost.getSalaryRangeMin().toString());
            } else if (jobPost.getSalaryRangeMax() != null) {
                return String.format("Jusqu'à %s €", jobPost.getSalaryRangeMax().toString());
            }
        }
        return "Non communiqué";
    }

    /**
     * Convertit le niveau requis en type d'emploi.
     */
    default EmploymentType convertEmploymentType(String requiredLevel) {
        if (requiredLevel == null) {
            return EmploymentType.FULL_TIME;
        }

        return switch (requiredLevel.toUpperCase()) {
            case "JUNIOR", "INTERMEDIARY", "SENIOR", "LEAD", "MANAGER" -> EmploymentType.FULL_TIME;
            default -> EmploymentType.FULL_TIME;
        };
    }
}
