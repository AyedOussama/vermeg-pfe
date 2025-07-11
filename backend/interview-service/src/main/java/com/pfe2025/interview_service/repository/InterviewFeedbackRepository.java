package com.pfe2025.interview_service.repository;

import com.pfe2025.interview_service.model.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {

    List<InterviewFeedback> findByInterviewId(Long interviewId);

    List<InterviewFeedback> findByEvaluatorId(String evaluatorId);

    Optional<InterviewFeedback> findByInterviewIdAndEvaluatorId(Long interviewId, String evaluatorId);

    @Query("SELECT f FROM InterviewFeedback f WHERE f.interview.id = :interviewId AND f.hasSubmitted = true")
    List<InterviewFeedback> findSubmittedFeedbacksByInterviewId(@Param("interviewId") Long interviewId);

    @Query("SELECT AVG(f.technicalScore) FROM InterviewFeedback f WHERE f.interview.id = :interviewId AND f.hasSubmitted = true")
    Double calculateAverageTechnicalScore(@Param("interviewId") Long interviewId);

    @Query("SELECT AVG(f.culturalScore) FROM InterviewFeedback f WHERE f.interview.id = :interviewId AND f.hasSubmitted = true")
    Double calculateAverageCulturalScore(@Param("interviewId") Long interviewId);

    @Query("SELECT AVG(f.communicationScore) FROM InterviewFeedback f WHERE f.interview.id = :interviewId AND f.hasSubmitted = true")
    Double calculateAverageCommunicationScore(@Param("interviewId") Long interviewId);
}