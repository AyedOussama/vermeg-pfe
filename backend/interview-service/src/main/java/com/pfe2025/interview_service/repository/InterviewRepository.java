package com.pfe2025.interview_service.repository;

import com.pfe2025.interview_service.model.Interview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long>, JpaSpecificationExecutor<Interview> {

    Optional<Interview> findByApplicationId(Long applicationId);

    Page<Interview> findByCandidateId(String candidateId, Pageable pageable);

    Page<Interview> findByJobPostingId(Long jobPostingId, Pageable pageable);

    @Query("SELECT i FROM Interview i WHERE i.status = :status AND i.scheduledAt BETWEEN :startDate AND :endDate")
    List<Interview> findByStatusAndScheduledBetween(
            @Param("status") Interview.InterviewStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT i FROM Interview i WHERE i.status = :status AND i.scheduledAt <= :deadline")
    List<Interview> findUpcomingInterviews(
            @Param("status") Interview.InterviewStatus status,
            @Param("deadline") LocalDateTime deadline);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.status = :status")
    Long countByStatus(@Param("status") Interview.InterviewStatus status);

    List<Interview> findByStatusAndScheduledAtBefore(Interview.InterviewStatus status, LocalDateTime dateTime);

    @Query("SELECT i FROM Interview i WHERE i.deleted = false AND i.applicationId = :applicationId")
    Optional<Interview> findActiveByApplicationId(@Param("applicationId") Long applicationId);
}