package com.pfe2025.jobrequisitionservice.service;

import com.pfe2025.jobrequisitionservice.dto.JobRequisitionDto;
import com.pfe2025.jobrequisitionservice.dto.JobRequisitionSummaryDTO;
import com.pfe2025.jobrequisitionservice.dto.StatusHistoryResponseDto;
import com.pfe2025.jobrequisitionservice.dto.StatusUpdateDto;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Interface du service métier pour la gestion des réquisitions de poste.
 * Définit les opérations disponibles pour manipuler les réquisitions tout au long
 * de leur cycle de vie.
 */
public interface JobRequisitionService {

    /**
     * Crée une nouvelle réquisition de poste
     */
    JobRequisitionDto.Response createRequisition(JobRequisitionDto.Request request);

    /**
     * Met à jour une réquisition existante
     */
    JobRequisitionDto.Response updateRequisition(Long id, JobRequisitionDto.Request request);

    /**
     * Soumet une réquisition pour approbation du CEO
     */
    JobRequisitionDto.Response submitRequisition(Long id);

    /**
     * Traite la décision du CEO (approbation ou rejet)
     */
    JobRequisitionDto.Response processCeoDecision(Long id, JobRequisitionDto.CeoDecision decision);

    /**
     * Récupère une réquisition par son identifiant
     */
    JobRequisitionDto.Response getRequisitionById(Long id);

    /**
     * Récupère toutes les réquisitions
     */
    List<JobRequisitionDto.Response> getAllRequisitions();

    /**
     * Récupère les réquisitions par statut
     */
    List<JobRequisitionDto.Response> getRequisitionsByStatus(RequisitionStatus status);

    /**
     * Récupère les réquisitions créées par l'utilisateur courant
     */
    List<JobRequisitionDto.Response> getMyRequisitions();

    /**
     * Récupère les réquisitions en attente d'approbation du CEO
     */
    List<JobRequisitionDto.Response> getPendingApproval();

    /**
     * Récupère l'historique des changements de statut d'une réquisition
     */
    List<StatusHistoryResponseDto> getRequisitionHistory(Long id);

    /**
     * Annule une réquisition
     */
    JobRequisitionDto.Response cancelRequisition(Long id, String comments);

    /**
     * Recherche les réquisitions selon différents critères
     */
    List<JobRequisitionSummaryDTO> searchRequisitions(
            RequisitionStatus status,
            String projectLeaderId,
            String department,
            String title);

    /**
     * Version paginée de la recherche
     */
    Page<JobRequisitionSummaryDTO> searchRequisitionsWithPagination(
            RequisitionStatus status,
            String projectLeaderId,
            String department,
            String title,
            Pageable pageable);

    /**
     * Marque une réquisition comme étant en cours de recrutement
     */
    JobRequisitionDto.Response markAsInProgress(Long id);

    /**
     * Marque une réquisition comme pourvue
     */
    JobRequisitionDto.Response markAsFulfilled(Long id);

    /**
     * Clôture une réquisition
     */
    JobRequisitionDto.Response closeRequisition(Long id, String reason);

    /**
     * Supprime une réquisition en état DRAFT
     */
    boolean deleteRequisition(Long id);

    /**
     * Met à jour le statut d'une réquisition
     */
    JobRequisitionDto.Response updateJobStatus(Long id, StatusUpdateDto statusUpdate);

    }