package com.pfe2025.jobpostingservice.mapper;


import com.pfe2025.jobpostingservice.dto.ActivityLogDTO;
import com.pfe2025.jobpostingservice.model.ActivityLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper pour la conversion entre entités ActivityLog et DTOs.
 */
@Mapper(componentModel = "spring")
public interface ActivityLogMapper {

    @Mapping(target = "jobPostId", source = "jobPost.id")
    ActivityLogDTO toDto(ActivityLog log);

    /**
     * Convertit un ensemble de logs en liste de DTOs, triée par date.
     */
    default List<ActivityLogDTO> toDtoList(Set<ActivityLog> logs) {
        if (logs == null) {
            return List.of();
        }

        return logs.stream()
                .map(this::toDto)
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp())) // Tri par date décroissante
                .collect(Collectors.toList());
    }
}
