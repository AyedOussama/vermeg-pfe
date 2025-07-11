package com.pfe2025.interview_service.mapper;

import com.pfe2025.interview_service.dto.InterviewSlotDTO;
import com.pfe2025.interview_service.model.InterviewSlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper for InterviewSlot entity and DTOs.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InterviewSlotMapper {

    @Mapping(target = "slotStatus", source = "status")
    @Mapping(target = "slotFormat", source = "format")
    InterviewSlotDTO.SlotResponse toResponse(InterviewSlot slot);

    List<InterviewSlotDTO.SlotResponse> toResponseList(List<InterviewSlot> slots);

    @Mapping(target = "status", constant = "PROPOSED")
    @Mapping(target = "interview", ignore = true)
    @Mapping(target = "googleCalendarEventId", ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    InterviewSlot fromRequest(InterviewSlotDTO.CreateRequest request);
}