package com.pfe2025.jobpostingservice.repository;


import com.pfe2025.jobpostingservice.model.MetricsDailySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository pour les snapshots quotidiens des métriques.
 */
@Repository
public interface MetricsDailySnapshotRepository extends JpaRepository<MetricsDailySnapshot, Long> {

    /**
     * Trouve un snapshot par id de métriques et date.
     */
    Optional<MetricsDailySnapshot> findByMetricsIdAndDate(Long metricsId, LocalDate date);

    /**
     * Trouve les snapshots par id de métriques.
     */
    List<MetricsDailySnapshot> findByMetricsId(Long metricsId);

    /**
     * Trouve les snapshots par id de métriques pour une période donnée.
     */
    @Query("SELECT s FROM MetricsDailySnapshot s " +
            "WHERE s.metrics.id = :metricsId " +
            "AND s.date BETWEEN :startDate AND :endDate " +
            "ORDER BY s.date")
    List<MetricsDailySnapshot> findByMetricsIdAndDateBetween(
            @Param("metricsId") Long metricsId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Trouve les snapshots pour une offre donnée.
     */
    @Query("SELECT s FROM MetricsDailySnapshot s " +
            "WHERE s.metrics.jobPost.id = :jobPostId " +
            "ORDER BY s.date")
    List<MetricsDailySnapshot> findByJobPostId(@Param("jobPostId") Long jobPostId);

    /**
     * Calcule les métriques agrégées pour une période donnée.
     */
    @Query("SELECT SUM(s.dailyViewCount), SUM(s.dailyUniqueViewCount), SUM(s.dailyApplicationCount) " +
            "FROM MetricsDailySnapshot s " +
            "WHERE s.metrics.id = :metricsId " +
            "AND s.date BETWEEN :startDate AND :endDate")
    Object[] getAggregatedMetrics(
            @Param("metricsId") Long metricsId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
