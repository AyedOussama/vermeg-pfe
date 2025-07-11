package com.pfe2025.jobrequisitionservice.mapper;

import com.pfe2025.jobrequisitionservice.dto.StatusHistoryResponseDto;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatusHistory;
import org.mapstruct.*;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Interface de mapper pour les conversions entre entités et DTOs liés à l'historique des statuts.
 * Utilise MapStruct pour générer l'implémentation.
 */
@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StatusHistoryMapper {

    /**
     * Convertit une entité en DTO
     */
    StatusHistoryResponseDto toStatusHistoryDto(RequisitionStatusHistory entity);

    /**
     * Convertit un ensemble d'entités en ensemble de DTOs
     */
    Set<StatusHistoryResponseDto> toStatusHistoryDtoSet(Set<RequisitionStatusHistory> entities);

    /**
     * Convertit une liste d'entités en liste de DTOs
     */
    List<StatusHistoryResponseDto> toStatusHistoryDtoList(List<RequisitionStatusHistory> entities);

    /**
     * Post-traite la liste pour la trier par date (du plus récent au plus ancien)
     */
    @AfterMapping
    default List<StatusHistoryResponseDto> sortByChangedAtDesc(@MappingTarget List<StatusHistoryResponseDto> dtos) {
        return dtos.stream()
                .sorted(Comparator.comparing(StatusHistoryResponseDto::getChangedAt).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Convertit un ensemble d'entités en liste de DTOs triés
     */
    default List<StatusHistoryResponseDto> toStatusHistoryDtoListFromSet(Set<RequisitionStatusHistory> entities) {
        if (entities == null) {
            return List.of();
        }

        return sortByChangedAtDesc(entities.stream()
                .map(this::toStatusHistoryDto)
                .collect(Collectors.toList()));
    }
}