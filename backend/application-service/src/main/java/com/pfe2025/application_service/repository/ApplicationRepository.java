package com.pfe2025.application_service.repository;

import com.pfe2025.application_service.model.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {

    @Override
    @EntityGraph(attributePaths = {"statusHistory", "evaluation"})
    Optional<Application> findById(@NonNull Long id);

    @EntityGraph(attributePaths = {"statusHistory", "evaluation"})
    Optional<Application> findByReference(@NonNull String reference);

    @EntityGraph(attributePaths = {"statusHistory", "evaluation"})
    Optional<Application> findByCandidateIdAndJobPostingId(@NonNull String candidateId, @NonNull Long jobPostingId);

    @EntityGraph(attributePaths = {"statusHistory", "evaluation"})
    Optional<Application> findByIdAndCandidateId(@NonNull Long id, @NonNull String candidateId);

    @EntityGraph(attributePaths = {"statusHistory", "evaluation"})
    Page<Application> findByCandidateId(@NonNull String candidateId, @NonNull Pageable pageable);

    @EntityGraph(attributePaths = {"statusHistory", "evaluation"})
    Page<Application> findByJobPostingId(@NonNull Long jobPostingId, @NonNull Pageable pageable);

    @EntityGraph(attributePaths = {"statusHistory", "evaluation"})
    List<Application> findAllByJobPostingId(@NonNull Long jobPostingId);

    @EntityGraph(attributePaths = {"evaluation"})
    @Query("SELECT a FROM Application a WHERE a.aiProcessed = false AND a.resumeDocumentId IS NOT NULL AND (a.status = 'SUBMITTED' OR a.status = 'UNDER_REVIEW') ORDER BY a.submittedAt ASC")
    List<Application> findApplicationsNeedingAIEvaluation();

    // Additional methods with entity graphs
    @Override
    @EntityGraph(attributePaths = {"statusHistory", "evaluation"})
    List<Application> findAll();

    @Override
    @EntityGraph(attributePaths = {"statusHistory", "evaluation"})
    Page<Application> findAll(@NonNull Pageable pageable);

    // Fixed method for SubmittedAtBetween with LocalDateTime parameters
    List<Application> findBySubmittedAtBetween(@NonNull LocalDateTime start, @NonNull LocalDateTime end);

    @Query("SELECT CAST(a.submittedAt AS date) AS submissionDate, COUNT(a) AS count FROM Application a " +
            "WHERE a.submittedAt BETWEEN :startDate AND :endDate " +
            "GROUP BY CAST(a.submittedAt AS date)")
    List<Object[]> countBySubmissionDateBetween(@Param("startDate") @NonNull LocalDateTime startDate,
                                                @Param("endDate") @NonNull LocalDateTime endDate);

    @Query("SELECT a FROM Application a WHERE a.status = :status AND a.aiScore >= :minScore AND a.submittedAt >= :since")
    List<Application> findHighScoringRecentApplications(
            @Param("status") @NonNull Application.ApplicationStatus status,
            @Param("minScore") @NonNull Double minScore,
            @Param("since") @NonNull LocalDateTime since);

    @Query("SELECT a FROM Application a WHERE a.status = :status AND a.lastStatusChangedAt <= :threshold")
    List<Application> findStaleApplications(
            @Param("status") @NonNull Application.ApplicationStatus status,
            @Param("threshold") @NonNull LocalDateTime threshold);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status = :status AND a.autoDecision = true AND a.id IN :applicationIds")
    Long countAutoDecisionsByStatusAndApplicationIds(
            @Param("status") @NonNull Application.ApplicationStatus status,
            @Param("applicationIds") @NonNull List<Long> applicationIds);

    // Fixed DATEDIFF function issue by using timestampdiff instead
    @Query("SELECT AVG(FUNCTION('timestampdiff', MINUTE, a.submittedAt, a.processedAt)) FROM Application a " +
            "WHERE a.id IN :applicationIds AND a.submittedAt IS NOT NULL AND a.processedAt IS NOT NULL")
    Double calculateAverageProcessingTimeMinutes(@Param("applicationIds") @NonNull List<Long> applicationIds);

    @Query("SELECT AVG(a.aiScore) FROM Application a WHERE a.id IN :applicationIds AND a.aiScore IS NOT NULL")
    Double calculateAverageEvaluationScore(@Param("applicationIds") @NonNull List<Long> applicationIds);
}