package com.pfe2025.interview_service.mapper;

import com.pfe2025.interview_service.dto.FeedbackDTO;
import com.pfe2025.interview_service.model.InterviewFeedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper for InterviewFeedback entity and DTOs.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FeedbackMapper {

    @Mapping(target = "feedbackRecommendation", source = "recommendation")
    FeedbackDTO.FeedbackResponse toResponse(InterviewFeedback feedback);

    List<FeedbackDTO.FeedbackResponse> toResponseList(List<InterviewFeedback> feedbacks);

    @Mapping(target = "interview", ignore = true)
    @Mapping(target = "hasSubmitted", constant = "true")
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "evaluatorId", expression = "java(getCurrentUserId())")
    @Mapping(target = "evaluatorName", expression = "java(getCurrentUserName())")
    InterviewFeedback fromRequest(FeedbackDTO.SubmitFeedbackRequest request);

    // Helper methods (to be implemented based on security context)
    default String getCurrentUserId() {
        // Implementation needed for getting current user ID from security context
        return "current-user-id";
    }

    default String getCurrentUserName() {
        // Implementation needed for getting current user name from security context
        return "Current User";
    }
}