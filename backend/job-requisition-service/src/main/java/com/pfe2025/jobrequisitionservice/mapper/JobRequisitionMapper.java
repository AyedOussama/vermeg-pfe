package com.pfe2025.jobrequisitionservice.mapper;

import com.pfe2025.jobrequisitionservice.dto.JobRequisitionDto;
import com.pfe2025.jobrequisitionservice.dto.JobRequisitionSummaryDTO;
import com.pfe2025.jobrequisitionservice.model.JobRequisition;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import org.mapstruct.*;

import java.util.List;
import java.util.Set;

/**
 * Interface de mapper pour les conversions entre entités et DTOs liés aux réquisitions de poste.
 * Utilise MapStruct pour générer l'implémentation.
 */
@Mapper(componentModel = "spring",
        uses = StatusHistoryMapper.class,
        injectionStrategy = InjectionStrategy.CONSTRUCTOR,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface JobRequisitionMapper {

    /**
     * Convertit une entité en DTO de réponse complet
     */
    @Mapping(target = "statusHistory", source = "statusHistory")
    JobRequisitionDto.Response toResponseDto(JobRequisition entity);

    /**
     * Convertit une entité en DTO résumé
     */
    @Mapping(target = "requiredLevel", expression = "java(entity.getRequiredLevel().toString())")
    JobRequisitionSummaryDTO toSummaryDto(JobRequisition entity);

    /**
     * Convertit un DTO de requête en nouvelle entité
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "ceoId", ignore = true)
    @Mapping(target = "ceoResponseDate", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "statusHistory", ignore = true)
    @Mapping(target = "projectLeaderId", ignore = true)
    @Mapping(target = "projectLeaderName", ignore = true)
    JobRequisition toEntity(JobRequisitionDto.Request request);

    /**
     * Met à jour une entité existante à partir d'un DTO de requête
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "ceoId", ignore = true)
    @Mapping(target = "ceoResponseDate", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "statusHistory", ignore = true)
    @Mapping(target = "projectLeaderId", ignore = true)
    @Mapping(target = "projectLeaderName", ignore = true)
    void updateEntityFromDto(JobRequisitionDto.Request request, @MappingTarget JobRequisition entity);

    /**
     * Convertit une liste d'entités en liste de DTOs de réponse
     */
    List<JobRequisitionDto.Response> toResponseDtoList(List<JobRequisition> entities);

    /**
     * Convertit une liste d'entités en liste de DTOs de résumé
     */
    List<JobRequisitionSummaryDTO> toSummaryDtoList(List<JobRequisition> entities);
}