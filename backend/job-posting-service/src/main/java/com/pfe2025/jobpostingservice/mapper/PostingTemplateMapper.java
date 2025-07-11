package com.pfe2025.jobpostingservice.mapper;


import com.pfe2025.jobpostingservice.dto.PostingTemplateDTO;
import com.pfe2025.jobpostingservice.model.PostingTemplate;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

/**
 * Mapper pour la conversion entre entités PostingTemplate et DTOs.
 */
@Mapper(componentModel = "spring")
public interface PostingTemplateMapper {

    PostingTemplateDTO.Response toResponseDto(PostingTemplate template);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "department", source = "department")
    @Mapping(target = "isActive", source = "isActive")
    PostingTemplateDTO.Summary toSummaryDto(PostingTemplate template);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    PostingTemplate toEntity(PostingTemplateDTO.Request dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateFromDto(PostingTemplateDTO.Request dto, @MappingTarget PostingTemplate template);

    List<PostingTemplateDTO.Response> toResponseDtoList(List<PostingTemplate> templates);

    List<PostingTemplateDTO.Summary> toSummaryDtoList(List<PostingTemplate> templates);
}
