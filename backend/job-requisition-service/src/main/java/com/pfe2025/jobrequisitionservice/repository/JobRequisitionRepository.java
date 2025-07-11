package com.pfe2025.jobrequisitionservice.repository;

import com.pfe2025.jobrequisitionservice.model.JobRequisition;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'accès aux données des réquisitions de poste.
 */
@Repository
public interface JobRequisitionRepository extends JpaRepository<JobRequisition, Long> {

    /**
     * Trouve les demandes par chef de projet (triées par date de création)
     */
    @Query("SELECT DISTINCT jr FROM JobRequisition jr WHERE jr.projectLeaderId = :projectLeaderId ORDER BY jr.createdAt DESC")
    List<JobRequisition> findByProjectLeaderIdOrderByCreatedAtDesc(@Param("projectLeaderId") String projectLeaderId);

    /**
     * Trouve toutes les demandes triées par date
     */
    @Query("SELECT DISTINCT jr FROM JobRequisition jr ORDER BY jr.createdAt DESC")
    List<JobRequisition> findAllByOrderByCreatedAtDesc();

    /**
     * Trouve par statut (triées par date)
     */
    @Query("SELECT DISTINCT jr FROM JobRequisition jr WHERE jr.status = :status ORDER BY jr.createdAt DESC")
    List<JobRequisition> findByStatusOrderByCreatedAtDesc(@Param("status") RequisitionStatus status);

    /**
     * Trouve par chef de projet et statut (triées par date)
     */
    @Query("SELECT DISTINCT jr FROM JobRequisition jr WHERE jr.projectLeaderId = :projectLeaderId AND jr.status = :status ORDER BY jr.createdAt DESC")
    List<JobRequisition> findByProjectLeaderIdAndStatusOrderByCreatedAtDesc(
            @Param("projectLeaderId") String projectLeaderId,
            @Param("status") RequisitionStatus status);

    /**
     * Compte par statut
     */
    long countByStatus(RequisitionStatus status);

    /**
     * Trouve par département (triées par date)
     */
    @Query("SELECT DISTINCT jr FROM JobRequisition jr WHERE jr.department = :department ORDER BY jr.createdAt DESC")
    List<JobRequisition> findByDepartmentOrderByCreatedAtDesc(@Param("department") String department);

    /**
     * Recherche avancée avec filtres dynamiques
     */
    @Query("SELECT DISTINCT jr FROM JobRequisition jr WHERE " +
            "(:status IS NULL OR jr.status = :status) AND " +
            "(:projectLeaderId IS NULL OR jr.projectLeaderId = :projectLeaderId) AND " +
            "(:department IS NULL OR jr.department = :department) AND " +
            "(:title IS NULL OR LOWER(jr.title) LIKE LOWER(CONCAT('%', :title, '%'))) " +
            "ORDER BY jr.createdAt DESC")
    List<JobRequisition> search(
            @Param("status") RequisitionStatus status,
            @Param("projectLeaderId") String projectLeaderId,
            @Param("department") String department,
            @Param("title") String title);

    /**
     * Requête pour obtenir les IDs avec pagination
     */
    @Query(value = "SELECT DISTINCT jr.id FROM JobRequisition jr WHERE " +
            "(:status IS NULL OR jr.status = :status) AND " +
            "(:projectLeaderId IS NULL OR jr.projectLeaderId = :projectLeaderId) AND " +
            "(:department IS NULL OR jr.department = :department) AND " +
            "(:title IS NULL OR LOWER(jr.title) LIKE LOWER(CONCAT('%', :title, '%')))",
            countQuery = "SELECT COUNT(DISTINCT jr.id) FROM JobRequisition jr WHERE " +
                    "(:status IS NULL OR jr.status = :status) AND " +
                    "(:projectLeaderId IS NULL OR jr.projectLeaderId = :projectLeaderId) AND " +
                    "(:department IS NULL OR jr.department = :department) AND " +
                    "(:title IS NULL OR LOWER(jr.title) LIKE LOWER(CONCAT('%', :title, '%')))")
    Page<Long> searchIdsWithPagination(
            @Param("status") RequisitionStatus status,
            @Param("projectLeaderId") String projectLeaderId,
            @Param("department") String department,
            @Param("title") String title,
            Pageable pageable);

    /**
     * Requête pour récupérer les entités par IDs
     */
    @Query("SELECT DISTINCT jr FROM JobRequisition jr WHERE jr.id IN :ids")
    List<JobRequisition> findByIds(@Param("ids") List<Long> ids);

    /**
     * Chargement d'une fiche avec historique
     */
    @Query("SELECT DISTINCT jr FROM JobRequisition jr LEFT JOIN FETCH jr.statusHistory WHERE jr.id = :id")
    Optional<JobRequisition> findByIdWithHistory(@Param("id") Long id);
}