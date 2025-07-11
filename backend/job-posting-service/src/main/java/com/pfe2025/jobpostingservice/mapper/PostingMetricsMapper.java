package com.pfe2025.jobpostingservice.mapper;


import com.pfe2025.jobpostingservice.dto.MetricsDailySnapshotDTO;
import com.pfe2025.jobpostingservice.dto.PostingMetricsDTO;
import com.pfe2025.jobpostingservice.model.MetricsDailySnapshot;
import com.pfe2025.jobpostingservice.model.PostingMetrics;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper pour la conversion entre entités liées aux métriques et DTOs.
 */
@Mapper(componentModel = "spring")
public interface PostingMetricsMapper {

    @Mapping(target = "jobPostId", source = "jobPost.id")
    PostingMetricsDTO toDto(PostingMetrics metrics);

    @Mapping(target = "jobPost", ignore = true)
    PostingMetrics toEntity(PostingMetricsDTO dto);

    MetricsDailySnapshotDTO toDto(MetricsDailySnapshot snapshot);

    @Mapping(target = "metrics", ignore = true)
    MetricsDailySnapshot toEntity(MetricsDailySnapshotDTO dto);

    /**
     * Convertit un ensemble de snapshots en liste de DTOs, triée par date.
     */
    default List<MetricsDailySnapshotDTO> toDtoList(Set<MetricsDailySnapshot> snapshots) {
        if (snapshots == null) {
            return List.of();
        }

        return snapshots.stream()
                .map(this::toDto)
                .sorted((a, b) -> b.getDate().compareTo(a.getDate())) // Tri par date décroissante
                .collect(Collectors.toList());
    }
}
