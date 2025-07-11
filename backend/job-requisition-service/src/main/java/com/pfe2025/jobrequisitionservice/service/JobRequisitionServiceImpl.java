package com.pfe2025.jobrequisitionservice.service;

import com.pfe2025.jobrequisitionservice.dto.JobRequisitionDto;
import com.pfe2025.jobrequisitionservice.dto.JobRequisitionSummaryDTO;
import com.pfe2025.jobrequisitionservice.dto.StatusHistoryResponseDto;
import com.pfe2025.jobrequisitionservice.dto.StatusUpdateDto;
import com.pfe2025.jobrequisitionservice.exception.ResourceNotFoundException;
import com.pfe2025.jobrequisitionservice.exception.StatusTransitionException;
import com.pfe2025.jobrequisitionservice.exception.UnauthorizedException;
import com.pfe2025.jobrequisitionservice.mapper.JobRequisitionMapper;
import com.pfe2025.jobrequisitionservice.mapper.StatusHistoryMapper;
import com.pfe2025.jobrequisitionservice.model.JobRequisition;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatusHistory;
import com.pfe2025.jobrequisitionservice.repository.JobRequisitionRepository;
import com.pfe2025.jobrequisitionservice.repository.RequisitionStatusHistoryRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Implémentation du service qui gère le cycle de vie complet des réquisitions de poste.
 * Cette classe regroupe toutes les fonctionnalités métier liées aux besoins de recrutement.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JobRequisitionServiceImpl implements JobRequisitionService {

    private final JobRequisitionRepository requisitionRepository;
    private final RequisitionStatusHistoryRepository statusHistoryRepository;
    private final JobRequisitionMapper jobRequisitionMapper;
    private final StatusHistoryMapper statusHistoryMapper;
    private final StatusTransitionService statusTransitionService;
    private final AuthenticationService authenticationService;
    private final MessagingService messagingService;

    /**
     * Crée une nouvelle réquisition de poste
     */
    @Override
    @Transactional
    public JobRequisitionDto.Response createRequisition(JobRequisitionDto.Request request) {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            String displayName = authenticationService.getCurrentUserDisplayName();

            log.debug("Creating requisition with title: {} by user: {}", request.getTitle(), currentUserId);

            // Convertir le DTO en entité
            JobRequisition requisition = jobRequisitionMapper.toEntity(request);
            requisition.setProjectLeaderId(currentUserId);
            requisition.setProjectLeaderName(displayName);
            requisition.setStatus(RequisitionStatus.DRAFT);

            // Sauvegarder la réquisition
            JobRequisition savedRequisition = requisitionRepository.save(requisition);
            log.debug("Saved requisition with ID: {}", savedRequisition.getId());

            // Créer l'entrée d'historique
            RequisitionStatusHistory statusHistory = RequisitionStatusHistory.builder()
                    .requisition(savedRequisition)
                    .oldStatus(null)
                    .newStatus(RequisitionStatus.DRAFT)
                    .changedBy(currentUserId)
                    .changedByName(displayName)
                    .comments("Initial creation")
                    .changedAt(LocalDateTime.now())
                    .build();

            statusHistoryRepository.save(statusHistory);
            log.debug("Created status history for requisition ID: {}", savedRequisition.getId());

            // Rafraîchir pour obtenir l'entité complète
            JobRequisition refreshedRequisition = requisitionRepository.findByIdWithHistory(savedRequisition.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Newly created requisition not found"));

            log.info("Successfully created job requisition ID: {}", refreshedRequisition.getId());

            return jobRequisitionMapper.toResponseDto(refreshedRequisition);
        } catch (Exception e) {
            log.error("Error creating requisition: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Met à jour une réquisition existante
     */
    @Override
    @Transactional
    public JobRequisitionDto.Response updateRequisition(Long id, JobRequisitionDto.Request request) {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            log.debug("Updating requisition ID: {} by user: {}", id, currentUserId);

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            if (!requisition.getProjectLeaderId().equals(currentUserId)) {
                throw new UnauthorizedException("Only the creator can update this requisition");
            }

            if (requisition.getStatus() != RequisitionStatus.DRAFT && requisition.getStatus() != RequisitionStatus.REJECTED) {
                throw new StatusTransitionException("Only requisitions in DRAFT or REJECTED status can be updated");
            }

            // Sauvegarder le statut actuel
            RequisitionStatus currentStatus = requisition.getStatus();

            // Mettre à jour l'entité
            jobRequisitionMapper.updateEntityFromDto(request, requisition);

            // Traitement spécial pour un changement de statut de REJECTED à DRAFT
            if (currentStatus == RequisitionStatus.REJECTED) {
                updateStatus(requisition, RequisitionStatus.DRAFT, "Requisition updated after rejection", currentUserId);
            }

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("Successfully updated job requisition ID: {}", updatedRequisition.getId());

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception e) {
            log.error("Error updating requisition ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Soumet une réquisition pour approbation du CEO
     */
    @Override
    @Transactional
    public JobRequisitionDto.Response submitRequisition(Long id) {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            log.debug("Submitting requisition ID: {} by user: {}", id, currentUserId);

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            if (!requisition.getProjectLeaderId().equals(currentUserId)) {
                throw new UnauthorizedException("Only the creator can submit this requisition");
            }

            statusTransitionService.validateTransition(requisition.getStatus(), RequisitionStatus.SUBMITTED);

            updateStatus(requisition, RequisitionStatus.SUBMITTED, "Submitted for CEO approval", currentUserId);

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("Successfully submitted job requisition ID: {}", updatedRequisition.getId());

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception e) {
            log.error("Error submitting requisition ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Traite la décision du CEO (approbation ou rejet)
     */
    @Override
    @Transactional
    @CircuitBreaker(name = "eventPublisher", fallbackMethod = "processCeoDecisionWithoutEvents")
    public JobRequisitionDto.Response processCeoDecision(Long id, JobRequisitionDto.CeoDecision decision) {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            log.debug("Processing CEO decision for requisition ID: {} by user: {}, approved: {}",
                    id, currentUserId, decision.isApproved());

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            statusTransitionService.validateTransition(requisition.getStatus(),
                    decision.isApproved() ? RequisitionStatus.APPROVED : RequisitionStatus.REJECTED);

            if (decision.isApproved()) {
                updateStatus(requisition, RequisitionStatus.APPROVED, "Approved by CEO", currentUserId);
                messagingService.publishApprovalEvent(messagingService.createApprovalEvent(requisition, currentUserId));
            } else {
                if (decision.getRejectionReason() == null || decision.getRejectionReason().trim().isEmpty()) {
                    throw new IllegalArgumentException("Rejection reason is required when rejecting a requisition");
                }
                updateStatus(requisition, RequisitionStatus.REJECTED, decision.getRejectionReason(), currentUserId);
                requisition.setRejectionReason(decision.getRejectionReason());
            }

            requisition.setCeoId(currentUserId);
            requisition.setCeoResponseDate(LocalDateTime.now());

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("CEO {} requisition ID: {}", decision.isApproved() ? "approved" : "rejected", updatedRequisition.getId());

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception e) {
            log.error("Error processing CEO decision for requisition ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Méthode de fallback pour le circuit breaker
     */
    public JobRequisitionDto.Response processCeoDecisionWithoutEvents(Long id, JobRequisitionDto.CeoDecision decision, Throwable t) {
        log.warn("Circuit breaker activated for CEO decision on requisition ID: {}. Processing without events. Error: {}",
                id, t.getMessage());

        // On continue avec la logique métier même si la publication d'événements échoue
        try {
            String currentUserId = authenticationService.getCurrentUserId();

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            statusTransitionService.validateTransition(requisition.getStatus(),
                    decision.isApproved() ? RequisitionStatus.APPROVED : RequisitionStatus.REJECTED);

            if (decision.isApproved()) {
                updateStatus(requisition, RequisitionStatus.APPROVED, "Approved by CEO", currentUserId);
                // Note: l'événement n'est pas publié en mode fallback
            } else {
                if (decision.getRejectionReason() == null || decision.getRejectionReason().trim().isEmpty()) {
                    throw new IllegalArgumentException("Rejection reason is required when rejecting a requisition");
                }
                updateStatus(requisition, RequisitionStatus.REJECTED, decision.getRejectionReason(), currentUserId);
                requisition.setRejectionReason(decision.getRejectionReason());
            }

            requisition.setCeoId(currentUserId);
            requisition.setCeoResponseDate(LocalDateTime.now());

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("CEO {} requisition ID: {} (fallback mode)", decision.isApproved() ? "approved" : "rejected",
                    updatedRequisition.getId());

            // Enregistrer un événement pour retentative ultérieure (pourrait être implémenté avec une table d'outbox)

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception fallbackEx) {
            log.error("Error in fallback method for CEO decision: {}", fallbackEx.getMessage(), fallbackEx);
            throw fallbackEx;
        }
    }

    /**
     * Récupère une réquisition par son identifiant
     */
    @Override
    @Transactional
    public JobRequisitionDto.Response getRequisitionById(Long id) {
        try {
            log.debug("Fetching requisition with ID: {}", id);

            JobRequisition requisition = requisitionRepository.findByIdWithHistory(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            log.info("Found requisition with ID: {}", id);
            return jobRequisitionMapper.toResponseDto(requisition);
        } catch (Exception e) {
            log.error("Error fetching requisition with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Récupère toutes les réquisitions
     */
    @Override
    @Transactional
    public List<JobRequisitionDto.Response> getAllRequisitions() {
        try {
            log.debug("Fetching all requisitions");
            List<JobRequisition> requisitions = requisitionRepository.findAllByOrderByCreatedAtDesc();
            log.info("Found {} requisitions", requisitions.size());

            return jobRequisitionMapper.toResponseDtoList(requisitions);
        } catch (Exception e) {
            log.error("Error fetching all requisitions: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Récupère les réquisitions par statut
     */
    @Override
    @Transactional
    public List<JobRequisitionDto.Response> getRequisitionsByStatus(RequisitionStatus status) {
        try {
            log.debug("Fetching requisitions with status: {}", status);
            List<JobRequisition> requisitions = requisitionRepository.findByStatusOrderByCreatedAtDesc(status);
            log.info("Found {} requisitions with status {}", requisitions.size(), status);

            return jobRequisitionMapper.toResponseDtoList(requisitions);
        } catch (Exception e) {
            log.error("Error fetching requisitions with status {}: {}", status, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Récupère les réquisitions créées par l'utilisateur courant
     */
    @Override
    @Transactional
    public List<JobRequisitionDto.Response> getMyRequisitions() {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            log.debug("Fetching requisitions for project leader: {}", currentUserId);

            List<JobRequisition> requisitions = requisitionRepository.findByProjectLeaderIdOrderByCreatedAtDesc(currentUserId);
            log.info("Found {} requisitions for project leader {}", requisitions.size(), currentUserId);

            return jobRequisitionMapper.toResponseDtoList(requisitions);
        } catch (Exception e) {
            log.error("Error fetching requisitions for current user: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Récupère les réquisitions en attente d'approbation du CEO
     */
    @Override
    @Transactional
    public List<JobRequisitionDto.Response> getPendingApproval() {
        try {
            log.debug("Fetching requisitions pending CEO approval");
            List<JobRequisition> requisitions = requisitionRepository.findByStatusOrderByCreatedAtDesc(RequisitionStatus.SUBMITTED);
            log.info("Found {} requisitions pending approval", requisitions.size());

            return jobRequisitionMapper.toResponseDtoList(requisitions);
        } catch (Exception e) {
            log.error("Error fetching requisitions pending approval: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Récupère l'historique des changements de statut d'une réquisition
     */
    @Override
    @Transactional
    public List<StatusHistoryResponseDto> getRequisitionHistory(Long id) {
        try {
            log.debug("Fetching history for requisition ID: {}", id);

            if (!requisitionRepository.existsById(id)) {
                throw new ResourceNotFoundException("Requisition not found with id: " + id);
            }

            List<RequisitionStatusHistory> historyEntries =
                    statusHistoryRepository.findByRequisitionIdOrderByChangedAtDesc(id);
            log.info("Found {} history entries for requisition {}", historyEntries.size(), id);

            return statusHistoryMapper.toStatusHistoryDtoList(historyEntries);
        } catch (Exception e) {
            log.error("Error fetching history for requisition ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Annule une réquisition
     */
    @Override
    @Transactional
    @CircuitBreaker(name = "eventPublisher", fallbackMethod = "cancelRequisitionWithoutEvents")
    public JobRequisitionDto.Response cancelRequisition(Long id, String comments) {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            log.debug("Cancelling requisition ID: {} by user: {}", id, currentUserId);

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            if (!requisition.getProjectLeaderId().equals(currentUserId) &&
                    !authenticationService.hasRole("RH_ADMIN") &&
                    !authenticationService.hasRole("CEO")) {
                throw new UnauthorizedException("Only the creator, RH_ADMIN or CEO can cancel this requisition");
            }

            statusTransitionService.validateTransition(requisition.getStatus(), RequisitionStatus.CANCELLED);

            updateStatus(requisition, RequisitionStatus.CANCELLED, comments, currentUserId);

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("Successfully cancelled job requisition ID: {}", updatedRequisition.getId());

            // Publish event
            messagingService.publishCancellationEvent(
                    messagingService.createCancellationEvent(updatedRequisition, currentUserId, comments));

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception e) {
            log.error("Error cancelling requisition ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Méthode de fallback pour le circuit breaker
     */
    public JobRequisitionDto.Response cancelRequisitionWithoutEvents(Long id, String comments, Throwable t) {
        log.warn("Circuit breaker activated for cancelling requisition ID: {}. Processing without events. Error: {}",
                id, t.getMessage());

        try {
            String currentUserId = authenticationService.getCurrentUserId();

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            if (!requisition.getProjectLeaderId().equals(currentUserId) &&
                    !authenticationService.hasRole("RH_ADMIN") &&
                    !authenticationService.hasRole("CEO")) {
                throw new UnauthorizedException("Only the creator, RH_ADMIN or CEO can cancel this requisition");
            }

            statusTransitionService.validateTransition(requisition.getStatus(), RequisitionStatus.CANCELLED);

            updateStatus(requisition, RequisitionStatus.CANCELLED, comments, currentUserId);

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("Successfully cancelled job requisition ID: {} (fallback mode)", updatedRequisition.getId());

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception fallbackEx) {
            log.error("Error in fallback method for cancellation: {}", fallbackEx.getMessage(), fallbackEx);
            throw fallbackEx;
        }
    }

    /**
     * Recherche les réquisitions selon différents critères
     */
    @Override
    @Transactional
    public List<JobRequisitionSummaryDTO> searchRequisitions(
            RequisitionStatus status,
            String projectLeaderId,
            String department,
            String title) {
        try {
            log.debug("Searching requisitions with criteria - status: {}, projectLeaderId: {}, department: {}, title: {}",
                    status, projectLeaderId, department, title);

            List<JobRequisition> requisitions;

            if (status != null || projectLeaderId != null || department != null || title != null) {
                requisitions = requisitionRepository.search(status, projectLeaderId, department, title);
            } else {
                requisitions = requisitionRepository.findAllByOrderByCreatedAtDesc();
            }

            log.info("Found {} requisitions matching search criteria", requisitions.size());

            return jobRequisitionMapper.toSummaryDtoList(requisitions);
        } catch (Exception e) {
            log.error("Error searching requisitions: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Version paginée de la recherche
     */
    @Override
    @Transactional
    public Page<JobRequisitionSummaryDTO> searchRequisitionsWithPagination(
            RequisitionStatus status,
            String projectLeaderId,
            String department,
            String title,
            Pageable pageable) {
        try {
            log.debug("Searching requisitions with pagination - status: {}, projectLeaderId: {}, department: {}, title: {}, page: {}, size: {}",
                    status, projectLeaderId, department, title, pageable.getPageNumber(), pageable.getPageSize());

            // Étape 1: Récupérer les IDs avec pagination
            Page<Long> idPage = requisitionRepository.searchIdsWithPagination(
                    status, projectLeaderId, department, title, pageable);

            if (idPage.isEmpty()) {
                return new PageImpl<>(List.of(), pageable, 0);
            }

            // Étape 2: Récupérer les entités
            List<JobRequisition> requisitions = requisitionRepository.findByIds(idPage.getContent());

            // Étape 3: Trier la liste selon le même ordre que la page d'IDs
            Map<Long, Integer> idToPositionMap = new HashMap<>();
            for (int i = 0; i < idPage.getContent().size(); i++) {
                idToPositionMap.put(idPage.getContent().get(i), i);
            }

            requisitions.sort(Comparator.comparing(req -> idToPositionMap.getOrDefault(req.getId(), 0)));

            // Convertir en DTOs
            List<JobRequisitionSummaryDTO> summaryDtos = jobRequisitionMapper.toSummaryDtoList(requisitions);

            log.info("Found {} requisitions (page {} of {}) matching search criteria",
                    summaryDtos.size(),
                    idPage.getNumber() + 1,
                    idPage.getTotalPages());

            return new PageImpl<>(summaryDtos, pageable, idPage.getTotalElements());
        } catch (Exception e) {
            log.error("Error searching requisitions with pagination: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Marque une réquisition comme étant en cours de recrutement
     */
    @Override
    @Transactional
    public JobRequisitionDto.Response markAsInProgress(Long id) {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            log.debug("Marking requisition ID: {} as in progress by user: {}", id, currentUserId);

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            statusTransitionService.validateTransition(requisition.getStatus(), RequisitionStatus.IN_PROGRESS);

            updateStatus(requisition, RequisitionStatus.IN_PROGRESS,
                    "Job posting created, recruitment in progress", currentUserId);

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("Successfully marked job requisition ID: {} as in progress", updatedRequisition.getId());

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception e) {
            log.error("Error marking requisition ID {} as in progress: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Marque une réquisition comme pourvue
     */
    @Override
    @Transactional
    @CircuitBreaker(name = "eventPublisher", fallbackMethod = "markAsFulfilledWithoutEvents")
    public JobRequisitionDto.Response markAsFulfilled(Long id) {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            log.debug("Marking requisition ID: {} as fulfilled by user: {}", id, currentUserId);

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            statusTransitionService.validateTransition(requisition.getStatus(), RequisitionStatus.FULFILLED);

            updateStatus(requisition, RequisitionStatus.FULFILLED,
                    "All positions have been filled", currentUserId);

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("Successfully marked job requisition ID: {} as fulfilled", updatedRequisition.getId());

            // Publish event
            messagingService.publishFulfillmentEvent(
                    messagingService.createFulfillmentEvent(updatedRequisition, currentUserId));

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception e) {
            log.error("Error marking requisition ID {} as fulfilled: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Méthode de fallback pour le circuit breaker
     */
    public JobRequisitionDto.Response markAsFulfilledWithoutEvents(Long id, Throwable t) {
        log.warn("Circuit breaker activated for marking requisition ID: {} as fulfilled. Processing without events. Error: {}",
                id, t.getMessage());

        try {
            String currentUserId = authenticationService.getCurrentUserId();

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            statusTransitionService.validateTransition(requisition.getStatus(), RequisitionStatus.FULFILLED);

            updateStatus(requisition, RequisitionStatus.FULFILLED,
                    "All positions have been filled", currentUserId);

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("Successfully marked job requisition ID: {} as fulfilled (fallback mode)", updatedRequisition.getId());

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception fallbackEx) {
            log.error("Error in fallback method for marking as fulfilled: {}", fallbackEx.getMessage(), fallbackEx);
            throw fallbackEx;
        }
    }

    /**
     * Clôture une réquisition
     */
    @Override
    @Transactional
    public JobRequisitionDto.Response closeRequisition(Long id, String reason) {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            log.debug("Closing requisition ID: {} by user: {}", id, currentUserId);

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            statusTransitionService.validateTransition(requisition.getStatus(), RequisitionStatus.CLOSED);

            updateStatus(requisition, RequisitionStatus.CLOSED, reason, currentUserId);

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("Successfully closed job requisition ID: {}", updatedRequisition.getId());

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception e) {
            log.error("Error closing requisition ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Supprime une réquisition en état DRAFT
     */
    @Override
    @Transactional
    public boolean deleteRequisition(Long id) {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            log.debug("Deleting requisition ID: {} by user: {}", id, currentUserId);

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            if (!requisition.getProjectLeaderId().equals(currentUserId)) {
                throw new UnauthorizedException("Only the creator can delete this requisition");
            }

            if (requisition.getStatus() != RequisitionStatus.DRAFT) {
                throw new StatusTransitionException("Only requisitions in DRAFT status can be deleted");
            }

            // Delete all history entries first
            statusHistoryRepository.deleteAllByRequisitionId(id);
            log.debug("Deleted history entries for requisition ID: {}", id);

            // Then delete the requisition itself
            requisitionRepository.delete(requisition);
            log.info("Successfully deleted job requisition ID: {}", id);

            return true;
        } catch (Exception e) {
            log.error("Error deleting requisition ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Met à jour le statut d'une réquisition
     */
    @Override
    @Transactional
    public JobRequisitionDto.Response updateJobStatus(Long id, StatusUpdateDto statusUpdate) {
        try {
            String currentUserId = authenticationService.getCurrentUserId();
            log.debug("Updating status for requisition ID: {} to {} by user: {}",
                    id, statusUpdate.getNewStatus(), currentUserId);

            JobRequisition requisition = requisitionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition not found with id: " + id));

            // Validate status transition
            statusTransitionService.validateTransition(requisition.getStatus(), statusUpdate.getNewStatus());

            updateStatus(requisition, statusUpdate.getNewStatus(), statusUpdate.getComments(), currentUserId);

            JobRequisition updatedRequisition = requisitionRepository.save(requisition);
            log.info("Successfully updated status of job requisition ID: {} to {}",
                    updatedRequisition.getId(), updatedRequisition.getStatus());

            return jobRequisitionMapper.toResponseDto(updatedRequisition);
        } catch (Exception e) {
            log.error("Error updating status for requisition ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
    /**
     * Met à jour le statut d'une réquisition et crée une entrée d'historique
     *
     * @param requisition La réquisition à modifier
     * @param newStatus Le nouveau statut
     * @param comments Commentaires expliquant le changement
     * @param userId ID de l'utilisateur effectuant le changement
     */
    private void updateStatus(JobRequisition requisition, RequisitionStatus newStatus, String comments, String userId) {
        try {
            RequisitionStatus oldStatus = requisition.getStatus();
            String userDisplayName = authenticationService.getCurrentUserDisplayName();

            requisition.setStatus(newStatus);

            RequisitionStatusHistory statusHistory = RequisitionStatusHistory.builder()
                    .requisition(requisition)
                    .oldStatus(oldStatus)
                    .newStatus(newStatus)
                    .changedBy(userId)
                    .changedByName(userDisplayName)
                    .comments(comments)
                    .changedAt(LocalDateTime.now())
                    .build();

            statusHistoryRepository.save(statusHistory);

            // Publier un événement de changement de statut
            try {
                JobRequisitionSummaryDTO summary = jobRequisitionMapper.toSummaryDto(requisition);
                messagingService.publishStatusChangeEvent(
                        messagingService.createStatusChangedEvent(requisition, oldStatus, newStatus,
                                userDisplayName, comments, summary));
            } catch (Exception e) {
                // Log mais ne pas échouer la transaction
                log.warn("Failed to publish status change event for requisition ID: {}: {}",
                        requisition.getId(), e.getMessage());
            }

            log.debug("Updated status for requisition ID: {} from {} to {}",
                    requisition.getId(), oldStatus, newStatus);
        } catch (Exception e) {
            log.error("Error updating status for requisition ID {}: {}",
                    requisition.getId(), e.getMessage(), e);
            throw e;
        }
    }
}