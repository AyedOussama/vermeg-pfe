package com.pfe2025.interview_service.mapper;

import com.pfe2025.interview_service.dto.ParticipantDTO;
import com.pfe2025.interview_service.model.InterviewParticipant;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper for InterviewParticipant entity and DTOs.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ParticipantMapper {

    @Mapping(target = "participantStatus", source = "status")
    @Mapping(target = "participantRole", source = "role")
    ParticipantDTO.ParticipantResponse toResponse(InterviewParticipant participant);

    List<ParticipantDTO.ParticipantResponse> toResponseList(List<InterviewParticipant> participants);

    @Mapping(target = "status", constant = "INVITED")
    @Mapping(target = "interview", ignore = true)
    @Mapping(target = "slot", ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    InterviewParticipant fromRequest(ParticipantDTO.AddParticipantRequest request);
}