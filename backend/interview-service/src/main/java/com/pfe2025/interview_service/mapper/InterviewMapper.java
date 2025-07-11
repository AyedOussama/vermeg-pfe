package com.pfe2025.interview_service.mapper;

import com.pfe2025.interview_service.dto.InterviewDTO;
import com.pfe2025.interview_service.event.InterviewRequestedEvent;
import com.pfe2025.interview_service.model.Interview;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper for Interview entity and DTOs.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {InterviewSlotMapper.class, ParticipantMapper.class, FeedbackMapper.class})
public interface InterviewMapper {

    @Mapping(target = "scheduleDate", source = "scheduledAt")
    @Mapping(target = "currentStatus", source = "status")
    InterviewDTO.DetailResponse toDetailResponse(Interview interview);

    @Mapping(target = "scheduleDate", source = "scheduledAt")
    @Mapping(target = "currentStatus", source = "status")
    InterviewDTO.SummaryResponse toSummaryResponse(Interview interview);

    List<InterviewDTO.SummaryResponse> toSummaryResponseList(List<Interview> interviews);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "REQUESTED")
    @Mapping(target = "type", constant = "TECHNICAL")
    @Mapping(target = "slots", ignore = true)
    @Mapping(target = "participants", ignore = true)
    @Mapping(target = "feedbacks", ignore = true)
    @Mapping(target = "deleted", constant = "false")
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    Interview fromEvent(InterviewRequestedEvent event);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromDto(InterviewDTO.UpdateRequest dto, @MappingTarget Interview interview);
}