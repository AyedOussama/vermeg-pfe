package com.pfe2025.application_service.mapper;

import com.pfe2025.application_service.dto.AISettingsDTO;
import com.pfe2025.application_service.model.AISettings;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper pour les entités AISettings et DTOs associés.
 */
@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AISettingsMapper {

    /**
     * Convertit une entité AISettings en DTO.
     */
    AISettingsDTO toDto(AISettings settings);

    /**
     * Convertit une liste d'entités AISettings en liste de DTOs.
     */
    List<AISettingsDTO> toDtoList(List<AISettings> settings);

    /**
     * Convertit un DTO AISettings en entité.
     */
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    AISettings toEntity(AISettingsDTO dto);

    /**
     * Met à jour une entité AISettings à partir d'un DTO.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateFromDto(AISettingsDTO dto, @MappingTarget AISettings settings);
}