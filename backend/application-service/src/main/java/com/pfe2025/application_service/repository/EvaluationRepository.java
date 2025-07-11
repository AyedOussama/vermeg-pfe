package com.pfe2025.application_service.repository;

import com.pfe2025.application_service.model.Evaluation;
import com.pfe2025.application_service.model.Evaluation.EvaluationRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    Optional<Evaluation> findByApplicationId(Long applicationId);

    List<Evaluation> findByRecommendation(EvaluationRecommendation recommendation);

    List<Evaluation> findByOverallScoreGreaterThan(Double threshold);

    @Query("SELECT AVG(e.overallScore) FROM Evaluation e JOIN e.application a WHERE a.jobDepartment = :department")
    Double getAverageScoreByDepartment(@Param("department") String department);

    @Query("SELECT e.recommendation, COUNT(e) FROM Evaluation e JOIN e.application a " +
            "WHERE a.jobDepartment = :department GROUP BY e.recommendation")
    List<Object[]> countByRecommendationForDepartment(@Param("department") String department);

    @Query("SELECT AVG(e.overallScore) FROM Evaluation e JOIN e.application a " +
            "WHERE a.jobPostingId = :jobPostingId")
    Double getAverageScoreByJobPosting(@Param("jobPostingId") Long jobPostingId);

    @Query("SELECT e FROM Evaluation e JOIN e.application a " +
            "WHERE a.jobDepartment = :department AND e.createdAt BETWEEN :startDate AND :endDate")
    List<Evaluation> findByDepartmentAndDateRange(
            @Param("department") String department,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);
}