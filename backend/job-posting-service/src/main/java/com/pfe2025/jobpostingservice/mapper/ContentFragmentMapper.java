package com.pfe2025.jobpostingservice.mapper;


import com.pfe2025.jobpostingservice.dto.ContentFragmentDTO;
import com.pfe2025.jobpostingservice.model.ContentFragment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

/**
 * Mapper pour la conversion entre entités ContentFragment et DTOs.
 */
@Mapper(componentModel = "spring")
public interface ContentFragmentMapper {

    ContentFragmentDTO.Response toResponseDto(ContentFragment fragment);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "fragmentKey", source = "fragmentKey")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "language", source = "language")
    @Mapping(target = "isActive", source = "isActive")
    ContentFragmentDTO.Summary toSummaryDto(ContentFragment fragment);

    @Mapping(target = "id", ignore = true )
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedAt", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    ContentFragment toEntity(ContentFragmentDTO.Request dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedAt", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    void updateFromDto(ContentFragmentDTO.Request dto, @MappingTarget ContentFragment fragment);

    List<ContentFragmentDTO.Response> toResponseDtoList(List<ContentFragment> fragments);

    List<ContentFragmentDTO.Summary> toSummaryDtoList(List<ContentFragment> fragments);
}
