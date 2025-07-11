package com.pfe2025.interview_service.repository;

import com.pfe2025.interview_service.model.InterviewParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewParticipantRepository extends JpaRepository<InterviewParticipant, Long> {

    List<InterviewParticipant> findByInterviewId(Long interviewId);

    List<InterviewParticipant> findBySlotId(Long slotId);

    List<InterviewParticipant> findByUserId(String userId);

    @Query("SELECT ip FROM InterviewParticipant ip JOIN ip.interview i WHERE ip.userId = :userId AND i.scheduledAt BETWEEN :startDate AND :endDate")
    List<InterviewParticipant> findByUserIdAndDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT ip FROM InterviewParticipant ip WHERE ip.interview.id = :interviewId AND ip.role = :role")
    List<InterviewParticipant> findByInterviewIdAndRole(
            @Param("interviewId") Long interviewId,
            @Param("role") InterviewParticipant.ParticipantRole role);
}