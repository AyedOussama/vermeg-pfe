package com.pfe2025.application_service.repository;

import com.pfe2025.application_service.model.Metrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricsRepository extends JpaRepository<Metrics, Long> {

    Optional<Metrics> findByMetricsDateAndDepartment(LocalDate date, String department);

    List<Metrics> findByMetricsDateBetweenAndDepartmentOrderByMetricsDate(
            LocalDate startDate, LocalDate endDate, String department);

    List<Metrics> findByMetricsDateBetweenOrderByMetricsDate(
            LocalDate startDate, LocalDate endDate);

    @Query("SELECT AVG(m.averageEvaluationScore) FROM Metrics m " +
            "WHERE m.metricsDate BETWEEN :startDate AND :endDate " +
            "AND m.department = :department")
    Double calculateAverageScoreForPeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("department") String department);

    @Query("SELECT AVG(m.averageProcessingTimeMinutes) FROM Metrics m " +
            "WHERE m.metricsDate BETWEEN :startDate AND :endDate " +
            "AND m.department = :department")
    Double calculateAverageProcessingTimeForPeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("department") String department);
}