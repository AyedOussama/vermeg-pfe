package com.pfe2025.jobpostingservice.repository;

import com.pfe2025.jobpostingservice.model.PostingMetrics;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour les métriques des offres d'emploi.
 */
@Repository
public interface PostingMetricsRepository extends JpaRepository<PostingMetrics, Long> {

    /**
     * Trouve les métriques par id d'offre d'emploi.
     */
    Optional<PostingMetrics> findByJobPostId(Long jobPostId);

    /**
     * Récupère les métriques avec leurs snapshots quotidiens.
     */
    @Query("SELECT m FROM PostingMetrics m " +
            "LEFT JOIN FETCH m.dailySnapshots " +
            "WHERE m.id = :id")
    Optional<PostingMetrics> findByIdWithSnapshots(@Param("id") Long id);

    /**
     * Récupère les métriques avec leurs snapshots quotidiens par id d'offre.
     */
    @Query("SELECT m FROM PostingMetrics m " +
            "LEFT JOIN FETCH m.dailySnapshots " +
            "WHERE m.jobPost.id = :jobPostId")
    Optional<PostingMetrics> findByJobPostIdWithSnapshots(@Param("jobPostId") Long jobPostId);

    /**
     * Trouve les offres avec le plus de vues.
     */
    @Query("SELECT m FROM PostingMetrics m " +
            "JOIN m.jobPost jp " +
            "WHERE jp.status = 'PUBLISHED' " +
            "ORDER BY m.totalViewCount DESC")
    List<PostingMetrics> findTopByViews(Pageable pageable);

    /**
     * Trouve les offres avec le plus de candidatures.
     */
    @Query("SELECT m FROM PostingMetrics m " +
            "JOIN m.jobPost jp " +
            "WHERE jp.status = 'PUBLISHED' " +
            "ORDER BY m.totalApplicationCount DESC")
    List<PostingMetrics> findTopByApplications(Pageable pageable);

    /**
     * Trouve les offres avec le meilleur taux de conversion.
     */
    @Query("SELECT m FROM PostingMetrics m " +
            "JOIN m.jobPost jp " +
            "WHERE jp.status = 'PUBLISHED' " +
            "AND m.uniqueViewCount > 10 " + // Minimum pour éviter les valeurs aberrantes
            "ORDER BY m.conversionRate DESC")
    List<PostingMetrics> findTopByConversionRate(Pageable pageable);

    /**
     * Calcule les métriques agrégées par département.
     */
    @Query("SELECT jp.department, SUM(m.totalViewCount), SUM(m.uniqueViewCount), " +
            "SUM(m.totalApplicationCount), AVG(m.conversionRate) " +
            "FROM PostingMetrics m " +
            "JOIN m.jobPost jp " +
            "GROUP BY jp.department " +
            "ORDER BY SUM(m.totalApplicationCount) DESC")
    List<Object[]> getMetricsByDepartment();
}
