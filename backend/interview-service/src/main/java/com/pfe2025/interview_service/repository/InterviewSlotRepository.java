package com.pfe2025.interview_service.repository;

import com.pfe2025.interview_service.model.InterviewSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewSlotRepository extends JpaRepository<InterviewSlot, Long> {

    List<InterviewSlot> findByInterviewId(Long interviewId);

    List<InterviewSlot> findByInterviewIdAndStatus(Long interviewId, InterviewSlot.SlotStatus status);

    @Query("SELECT s FROM InterviewSlot s WHERE s.status = :status AND s.startDateTime <= :deadline")
    List<InterviewSlot> findExpiredSlots(
            @Param("status") InterviewSlot.SlotStatus status,
            @Param("deadline") LocalDateTime deadline);

    @Query("SELECT s FROM InterviewSlot s WHERE s.status = 'PROPOSED' AND s.startDateTime BETWEEN :startTime AND :endTime")
    List<InterviewSlot> findProposedSlotsBetween(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    List<InterviewSlot> findByGoogleCalendarEventId(String eventId);
}