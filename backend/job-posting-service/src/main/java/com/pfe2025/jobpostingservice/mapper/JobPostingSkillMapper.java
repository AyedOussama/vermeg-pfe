package com.pfe2025.jobpostingservice.mapper;


import com.pfe2025.jobpostingservice.dto.JobPostingSkillDTO;
import com.pfe2025.jobpostingservice.model.JobPostingSkill;
import com.pfe2025.jobpostingservice.model.JobPost;
import org.mapstruct.*;

import java.util.Set;

/**
 * Mapper pour la conversion entre entités JobPostingSkill et DTOs.
 */
@Mapper(componentModel = "spring")
public interface JobPostingSkillMapper {

    JobPostingSkillDTO toDto(JobPostingSkill skill);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "jobPost", ignore = true)
    JobPostingSkill toEntity(JobPostingSkillDTO dto);

    Set<JobPostingSkillDTO> toDtoSet(Set<JobPostingSkill> skills);

    /**
     * Convertit un ensemble de DTOs de compétences en entités.
     *
     * @param dtos Les DTOs source
     * @param jobPost L'offre d'emploi parent
     * @return Un ensemble d'entités JobPostingSkill
     */
    @IterableMapping(elementTargetType = JobPostingSkill.class)
    @Named("toEntitySetWithJobPost")
    default Set<JobPostingSkill> toEntitySetWithJobPost(Set<JobPostingSkillDTO> dtos, JobPost jobPost) {
        if (dtos == null) {
            return null;
        }

        return dtos.stream()
                .map(dto -> {
                    JobPostingSkill skill = toEntity(dto);
                    skill.setJobPost(jobPost);
                    return skill;
                })
                .collect(java.util.stream.Collectors.toSet());
    }

    /**
     * Met à jour un ensemble de compétences pour une offre d'emploi.
     *
     * @param dtos Les nouveaux DTOs de compétences
     * @param jobPost L'offre d'emploi à mettre à jour
     */
    @Named("updateSkillsFromDtos")
    default void updateSkillsFromDtos(Set<JobPostingSkillDTO> dtos, @MappingTarget JobPost jobPost) {
        if (dtos == null) {
            return;
        }

        // Supprimer les compétences existantes qui ne sont plus dans la liste
        jobPost.getSkills().removeIf(skill ->
                dtos.stream().noneMatch(dto ->
                        dto.getId() != null && dto.getId().equals(skill.getId())));

        // Ajouter ou mettre à jour les compétences
        dtos.forEach(dto -> {
            if (dto.getId() != null) {
                // Mettre à jour une compétence existante
                jobPost.getSkills().stream()
                        .filter(skill -> dto.getId().equals(skill.getId()))
                        .findFirst()
                        .ifPresent(skill -> {
                            skill.setName(dto.getName());
                            skill.setIsRequired(dto.getIsRequired());
                            skill.setDescription(dto.getDescription());
                            skill.setLevel(dto.getLevel());
                        });
            } else {
                // Ajouter une nouvelle compétence
                JobPostingSkill newSkill = toEntity(dto);
                newSkill.setJobPost(jobPost);
                jobPost.getSkills().add(newSkill);
            }
        });
    }
}
