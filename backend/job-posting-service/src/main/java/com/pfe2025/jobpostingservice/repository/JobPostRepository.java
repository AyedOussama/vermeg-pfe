package com.pfe2025.jobpostingservice.repository;

import com.pfe2025.jobpostingservice.model.JobPost;
import com.pfe2025.jobpostingservice.model.enums.EmploymentType;
import com.pfe2025.jobpostingservice.model.enums.PostingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository pour les offres d'emploi avec fonctionnalités avancées de recherche.
 */
@Repository
public interface JobPostRepository extends JpaRepository<JobPost, Long>, JpaSpecificationExecutor<JobPost> {

    /**
     * Récupère une offre avec ses compétences et métriques.
     */
    @Query("SELECT jp FROM JobPost jp " +
            "LEFT JOIN FETCH jp.skills " +
            "LEFT JOIN FETCH jp.metrics " +
            "WHERE jp.id = :id")
    Optional<JobPost> findByIdWithDetails(@Param("id") Long id);

    /**
     * Récupère une offre avec son historique d'activité.
     */
    @Query("SELECT jp FROM JobPost jp " +
            "LEFT JOIN FETCH jp.activityLog " +
            "WHERE jp.id = :id")
    Optional<JobPost> findByIdWithActivityLog(@Param("id") Long id);

    /**
     * Trouve les offres par statut.
     */
    List<JobPost> findByStatus(PostingStatus status);

    /**
     * Trouve les offres paginées par statut.
     */
    Page<JobPost> findByStatus(PostingStatus status, Pageable pageable);

    /**
     * Trouve les offres par département.
     */
    List<JobPost> findByDepartment(String department);

    /**
     * Trouve les offres par id de réquisition.
     */
    List<JobPost> findByRequisitionId(Long requisitionId);

    /**
     * Trouve les offres publiées.
     */
    @Query("SELECT jp FROM JobPost jp WHERE jp.status = 'PUBLISHED' AND jp.expiresAt > :now")
    List<JobPost> findAllActivePublished(@Param("now") LocalDateTime now);

    /**
     * Trouve les offres publiées (paginées).
     */
    @Query("SELECT jp FROM JobPost jp WHERE jp.status = 'PUBLISHED' AND jp.expiresAt > :now")
    Page<JobPost> findAllActivePublished(@Param("now") LocalDateTime now, Pageable pageable);

    /**
     * Recherche d'offres par mot-clé dans le titre ou la description.
     */
    @Query("SELECT jp FROM JobPost jp WHERE " +
            "LOWER(jp.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(jp.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<JobPost> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Recherche avancée d'offres publiées avec critères.
     */
    @Query("SELECT DISTINCT jp FROM JobPost jp " +
            "LEFT JOIN jp.skills s " +
            "WHERE jp.status = 'PUBLISHED' " +
            "AND jp.expiresAt > :now " +
            "AND (:department IS NULL OR jp.department = :department) " +
            "AND (:location IS NULL OR jp.location = :location) " +
            "AND (:employmentType IS NULL OR jp.employmentType = :employmentType) " +
            "AND (:minExperience IS NULL OR jp.minExperience >= :minExperience) " +
            "AND (:maxExperience IS NULL OR jp.minExperience <= :maxExperience) " +
            "AND (COALESCE(:skillNames) IS NULL OR s.name IN :skillNames) " +
            "AND (:keyword IS NULL OR LOWER(jp.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "     LOWER(jp.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<JobPost> advancedSearch(
            @Param("now") LocalDateTime now,
            @Param("department") String department,
            @Param("location") String location,
            @Param("employmentType") EmploymentType employmentType,
            @Param("minExperience") Integer minExperience,
            @Param("maxExperience") Integer maxExperience,
            @Param("skillNames") Set<String> skillNames,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * Recherche avancée d'offres (toutes) pour l'administration.
     */
    @Query("SELECT DISTINCT jp FROM JobPost jp " +
            "LEFT JOIN jp.skills s " +
            "WHERE (:status IS NULL OR jp.status = :status) " +
            "AND (:department IS NULL OR jp.department = :department) " +
            "AND (:createdBy IS NULL OR jp.createdBy = :createdBy) " +
            "AND (:keyword IS NULL OR LOWER(jp.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "     LOWER(jp.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<JobPost> adminSearch(
            @Param("status") PostingStatus status,
            @Param("department") String department,
            @Param("createdBy") String createdBy,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * Met à jour le statut des offres expirées.
     */
    @Modifying
    @Query("UPDATE JobPost jp SET jp.status = 'EXPIRED' " +
            "WHERE jp.status = 'PUBLISHED' AND jp.expiresAt <= :now")
    int updateExpiredJobPosts(@Param("now") LocalDateTime now);

    /**
     * Compte les offres par statut.
     */
    long countByStatus(PostingStatus status);

    /**
     * Compte les offres par département.
     */
    long countByDepartment(String department);

    /**
     * Compte les offres par id de réquisition.
     */
    long countByRequisitionId(Long requisitionId);

    /**
     * Récupère les offres dont les compétences contiennent celles spécifiées.
     */
    @Query("SELECT DISTINCT jp FROM JobPost jp JOIN jp.skills s " +
            "WHERE s.name IN :skillNames " +
            "AND jp.status = 'PUBLISHED'")
    Page<JobPost> findBySkillNames(@Param("skillNames") Set<String> skillNames, Pageable pageable);
}
