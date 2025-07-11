package com.pfe2025.jobpostingservice.repository;


import com.pfe2025.jobpostingservice.model.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour le journal d'activité.
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    /**
     * Trouve les entrées par id d'offre d'emploi.
     */
    List<ActivityLog> findByJobPostIdOrderByTimestampDesc(Long jobPostId);

    /**
     * Trouve les entrées paginées par id d'offre d'emploi.
     */
    Page<ActivityLog> findByJobPostIdOrderByTimestampDesc(Long jobPostId, Pageable pageable);

    /**
     * Trouve les entrées par action.
     */
    List<ActivityLog> findByAction(String action);

    /**
     * Trouve les entrées par utilisateur.
     */
    List<ActivityLog> findByUserIdOrderByTimestampDesc(String userId);

    /**
     * Recherche avancée dans les journaux d'activité.
     */
    @Query("SELECT a FROM ActivityLog a WHERE " +
            "(:jobPostId IS NULL OR a.jobPost.id = :jobPostId) AND " +
            "(:userId IS NULL OR a.userId = :userId) AND " +
            "(:action IS NULL OR a.action = :action) AND " +
            "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
            "(:endDate IS NULL OR a.timestamp <= :endDate)")
    Page<ActivityLog> advancedSearch(
            @Param("jobPostId") Long jobPostId,
            @Param("userId") String userId,
            @Param("action") String action,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    /**
     * Compte les activités par action.
     */
    long countByAction(String action);

    /**
     * Récupère les dernières activités pour le tableau de bord.
     */
    @Query("SELECT a FROM ActivityLog a " +
            "ORDER BY a.timestamp DESC")
    List<ActivityLog> findLatestActivities(Pageable pageable);

    /**
     * Récupère les dernières activités par utilisateur.
     */
    @Query("SELECT a FROM ActivityLog a " +
            "WHERE a.userId = :userId " +
            "ORDER BY a.timestamp DESC")
    List<ActivityLog> findLatestActivitiesByUser(@Param("userId") String userId, Pageable pageable);
}
