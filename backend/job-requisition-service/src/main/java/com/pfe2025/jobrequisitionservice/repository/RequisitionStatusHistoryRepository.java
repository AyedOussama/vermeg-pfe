package com.pfe2025.jobrequisitionservice.repository;

import com.pfe2025.jobrequisitionservice.model.RequisitionStatusHistory;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'accès aux données de l'historique des statuts des réquisitions.
 */
@Repository
public interface RequisitionStatusHistoryRepository extends JpaRepository<RequisitionStatusHistory, Long> {

    /**
     * Trouver l'historique par ID de réquisition, trié par date (plus récent en premier)
     */
    List<RequisitionStatusHistory> findByRequisitionIdOrderByChangedAtDesc(Long requisitionId);

    /**
     * Supprimer tout l'historique associé à une réquisition
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RequisitionStatusHistory h WHERE h.requisition.id = :requisitionId")
    void deleteAllByRequisitionId(@Param("requisitionId") Long requisitionId);

    /**
     * Trouver une entrée d'historique spécifique pour une réquisition donnée
     */
    Optional<RequisitionStatusHistory> findByIdAndRequisitionId(Long id, Long requisitionId);
}