package com.pfe2025.jobrequisitionservice.controller;

import com.pfe2025.jobrequisitionservice.dto.JobRequisitionDto;
import com.pfe2025.jobrequisitionservice.dto.JobRequisitionSummaryDTO;
import com.pfe2025.jobrequisitionservice.dto.StatusHistoryResponseDto;
import com.pfe2025.jobrequisitionservice.dto.StatusUpdateDto;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import com.pfe2025.jobrequisitionservice.service.JobRequisitionService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requisitions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Gestion des Réquisitions", description = "API pour gérer les besoins de recrutement")
public class JobRequisitionController {

    private final JobRequisitionService requisitionService;

    //-------------------------------------------------------------------------
    // PROJECT_LEADER endpoints
    //-------------------------------------------------------------------------

    @PostMapping("/create")
    @PreAuthorize("hasRole('PROJECT_LEADER')")
    @Operation(summary = "Créer un besoin de recrutement",
            description = "Permet à un chef de projet de créer un nouveau besoin de recrutement")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Réquisition créée avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    @RateLimiter(name = "default")
    public ResponseEntity<JobRequisitionDto.Response> createRequisition(
            @Valid @RequestBody JobRequisitionDto.Request request) {
        log.info("Creating new requisition with title: {}", request.getTitle());
        JobRequisitionDto.Response response = requisitionService.createRequisition(request);
        log.info("Successfully created requisition with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROJECT_LEADER')")
    @Operation(summary = "Mettre à jour un besoin de recrutement",
            description = "Permet à un chef de projet de mettre à jour un besoin de recrutement existant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Réquisition mise à jour avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée")
    })
    public ResponseEntity<JobRequisitionDto.Response> updateRequisition(
            @PathVariable Long id,
            @Valid @RequestBody JobRequisitionDto.Request request) {
        log.info("Updating requisition ID: {}", id);
        JobRequisitionDto.Response response = requisitionService.updateRequisition(id, request);
        log.info("Successfully updated requisition ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('PROJECT_LEADER')")
    @Operation(summary = "Soumettre un besoin de recrutement pour approbation",
            description = "Permet à un chef de projet de soumettre un besoin de recrutement pour approbation par le CEO")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Réquisition soumise avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée"),
            @ApiResponse(responseCode = "400", description = "Statut invalide pour soumission")
    })
    public ResponseEntity<JobRequisitionDto.Response> submitRequisition(@PathVariable Long id) {
        log.info("Submitting requisition ID: {} for approval", id);
        JobRequisitionDto.Response response = requisitionService.submitRequisition(id);
        log.info("Successfully submitted requisition ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-requisitions")
    @PreAuthorize("hasRole('PROJECT_LEADER')")
    @Operation(summary = "Obtenir mes besoins de recrutement",
            description = "Récupère les besoins de recrutement créés par le chef de projet connecté")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des réquisitions récupérée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<List<JobRequisitionDto.Response>> getMyRequisitions() {
        log.info("Retrieving requisitions for current project leader");
        List<JobRequisitionDto.Response> requisitions = requisitionService.getMyRequisitions();
        log.info("Found {} requisitions for current project leader", requisitions.size());
        return ResponseEntity.ok(requisitions);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PROJECT_LEADER')")
    @Operation(summary = "Annuler un besoin de recrutement",
            description = "Permet à un chef de projet d'annuler un besoin de recrutement")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Réquisition annulée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée"),
            @ApiResponse(responseCode = "400", description = "Statut invalide pour annulation")
    })
    public ResponseEntity<JobRequisitionDto.Response> cancelRequisition(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        log.info("Cancelling requisition ID: {}", id);
        String comments = request.getOrDefault("comments", "Besoin annulé par le chef de projet");
        JobRequisitionDto.Response response = requisitionService.cancelRequisition(id, comments);
        log.info("Successfully cancelled requisition ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROJECT_LEADER')")
    @Operation(summary = "Supprimer un besoin de recrutement",
            description = "Permet à un chef de projet de supprimer un besoin de recrutement en état brouillon")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Réquisition supprimée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée"),
            @ApiResponse(responseCode = "400", description = "Seules les réquisitions en brouillon peuvent être supprimées")
    })
    public ResponseEntity<Void> deleteRequisition(@PathVariable Long id) {
        log.info("Deleting requisition ID: {}", id);
        requisitionService.deleteRequisition(id);
        log.info("Successfully deleted requisition ID: {}", id);
        return ResponseEntity.noContent().build();
    }

    //-------------------------------------------------------------------------
    // CEO endpoints
    //-------------------------------------------------------------------------

    @PostMapping("/{id}/decision")
    @PreAuthorize("hasRole('CEO')")
    @Operation(summary = "Décision du CEO sur un besoin de recrutement",
            description = "Permet au CEO d'approuver ou rejeter un besoin de recrutement")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Décision enregistrée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée"),
            @ApiResponse(responseCode = "400", description = "Seules les réquisitions soumises peuvent être approuvées/rejetées")
    })
    public ResponseEntity<JobRequisitionDto.Response> processCeoDecision(
            @PathVariable Long id,
            @Valid @RequestBody JobRequisitionDto.CeoDecision decision) {
        log.info("Processing CEO decision for requisition ID: {} (approved: {})", id, decision.isApproved());
        JobRequisitionDto.Response response = requisitionService.processCeoDecision(id, decision);
        log.info("CEO {} requisition ID: {}", decision.isApproved() ? "approved" : "rejected", response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending-approval")
    @PreAuthorize("hasRole('CEO')")
    @Operation(summary = "Obtenir les besoins de recrutement en attente d'approbation",
            description = "Permet au CEO de récupérer les besoins de recrutement qui attendent son approbation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<List<JobRequisitionDto.Response>> getPendingApproval() {
        log.info("Retrieving requisitions pending approval");
        List<JobRequisitionDto.Response> requisitions = requisitionService.getPendingApproval();
        log.info("Found {} requisitions pending approval", requisitions.size());
        return ResponseEntity.ok(requisitions);
    }

    //-------------------------------------------------------------------------
    // RH_ADMIN endpoints
    //-------------------------------------------------------------------------

    @PostMapping("/{id}/in-progress")
    @PreAuthorize("hasRole('RH_ADMIN')")
    @Operation(summary = "Marquer un besoin de recrutement comme en cours",
            description = "Permet à un administrateur RH de marquer un besoin comme étant en cours (après création d'une offre d'emploi)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Réquisition mise à jour avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée"),
            @ApiResponse(responseCode = "400", description = "Seules les réquisitions approuvées peuvent être mises en cours")
    })
    public ResponseEntity<JobRequisitionDto.Response> markAsInProgress(@PathVariable Long id) {
        log.info("Marking requisition ID: {} as in progress", id);
        JobRequisitionDto.Response response = requisitionService.markAsInProgress(id);
        log.info("Requisition ID: {} is now in progress", response.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/fulfilled")
    @PreAuthorize("hasRole('RH_ADMIN')")
    @Operation(summary = "Marquer un besoin de recrutement comme pourvu",
            description = "Permet à un administrateur RH de marquer un besoin comme étant pourvu (tous les postes remplis)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Réquisition mise à jour avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée"),
            @ApiResponse(responseCode = "400", description = "Seules les réquisitions en cours peuvent être marquées comme pourvues")
    })
    public ResponseEntity<JobRequisitionDto.Response> markAsFulfilled(@PathVariable Long id) {
        log.info("Marking requisition ID: {} as fulfilled", id);
        JobRequisitionDto.Response response = requisitionService.markAsFulfilled(id);
        log.info("Requisition ID: {} is now fulfilled", response.getId());
        return ResponseEntity.ok(response);
    }

    //-------------------------------------------------------------------------
    // Common/shared endpoints
    //-------------------------------------------------------------------------

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROJECT_LEADER', 'CEO', 'RH_ADMIN')")
    @Operation(summary = "Obtenir un besoin de recrutement par ID",
            description = "Récupère les détails d'un besoin de recrutement spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Réquisition récupérée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée")
    })
    public ResponseEntity<JobRequisitionDto.Response> getRequisitionById(@PathVariable Long id) {
        log.info("Retrieving requisition ID: {}", id);
        JobRequisitionDto.Response response = requisitionService.getRequisitionById(id);
        log.info("Found requisition with title: {}", response.getTitle());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    @Operation(summary = "Obtenir tous les besoins de recrutement",
            description = "Récupère une liste de tous les besoins de recrutement")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<List<JobRequisitionDto.Response>> getAllRequisitions() {
        log.info("Retrieving all requisitions");
        List<JobRequisitionDto.Response> requisitions = requisitionService.getAllRequisitions();
        log.info("Found {} requisitions in total", requisitions.size());
        return ResponseEntity.ok(requisitions);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('PROJECT_LEADER', 'CEO', 'RH_ADMIN')")
    @Operation(summary = "Obtenir l'historique d'un besoin de recrutement",
            description = "Récupère l'historique des statuts d'un besoin de recrutement spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Historique récupéré avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée")
    })
    public ResponseEntity<List<StatusHistoryResponseDto>> getRequisitionHistory(@PathVariable Long id) {
        log.info("Retrieving history for requisition ID: {}", id);
        List<StatusHistoryResponseDto> history = requisitionService.getRequisitionHistory(id);
        log.info("Found {} history entries for requisition ID: {}", history.size(), id);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    @Operation(summary = "Rechercher des besoins de recrutement",
            description = "Recherche avancée des besoins de recrutement selon plusieurs critères")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Recherche effectuée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<List<JobRequisitionSummaryDTO>> searchRequisitions(
            @RequestParam(required = false) RequisitionStatus status,
            @RequestParam(required = false) String projectLeaderId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String title) {

        log.info("Searching requisitions with criteria - status: {}, projectLeaderId: {}, department: {}, title: {}",
                status, projectLeaderId, department, title);

        List<JobRequisitionSummaryDTO> requisitions = requisitionService.searchRequisitions(
                status, projectLeaderId, department, title);

        log.info("Found {} requisitions matching search criteria", requisitions.size());
        return ResponseEntity.ok(requisitions);
    }

    @GetMapping("/search/paged")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    @Operation(summary = "Rechercher des besoins de recrutement (paginé)",
            description = "Recherche paginée des besoins de recrutement selon plusieurs critères")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Recherche effectuée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<Page<JobRequisitionSummaryDTO>> searchRequisitionsWithPagination(
            @RequestParam(required = false) RequisitionStatus status,
            @RequestParam(required = false) String projectLeaderId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        log.info("Searching requisitions with pagination - page: {}, size: {}, sortBy: {}, sortDir: {}",
                page, size, sortBy, sortDir);

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<JobRequisitionSummaryDTO> requisitionsPage = requisitionService.searchRequisitionsWithPagination(
                status, projectLeaderId, department, title, pageRequest);

        log.info("Found {} requisitions (page {} of {}) matching search criteria",
                requisitionsPage.getNumberOfElements(),
                requisitionsPage.getNumber() + 1,
                requisitionsPage.getTotalPages());

        return ResponseEntity.ok(requisitionsPage);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('PROJECT_LEADER', 'CEO', 'RH_ADMIN')")
    @Operation(summary = "Mettre à jour le statut d'une réquisition",
            description = "Permet de changer le statut d'une réquisition avec des commentaires")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statut mis à jour avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée"),
            @ApiResponse(responseCode = "400", description = "Transition de statut invalide")
    })
    public ResponseEntity<JobRequisitionDto.Response> updateJobStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDto statusUpdate) {

        log.info("Updating status for requisition ID: {} to {}", id, statusUpdate.getNewStatus());
        JobRequisitionDto.Response response = requisitionService.updateJobStatus(id, statusUpdate);
        log.info("Successfully updated status of requisition ID: {} to {}", response.getId(), response.getStatus());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('RH_ADMIN', 'CEO')")
    @Operation(summary = "Clôturer un besoin de recrutement",
            description = "Permet de clôturer définitivement un besoin de recrutement")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Réquisition clôturée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
            @ApiResponse(responseCode = "404", description = "Réquisition non trouvée")
    })
    public ResponseEntity<JobRequisitionDto.Response> closeRequisition(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        log.info("Closing requisition ID: {}", id);
        String reason = request.getOrDefault("reason", "Besoin clôturé");

        JobRequisitionDto.Response response = requisitionService.closeRequisition(id, reason);
        log.info("Successfully closed requisition ID: {}", response.getId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    @Operation(summary = "Obtenir les besoins de recrutement par statut",
            description = "Récupère une liste des besoins de recrutement filtrés par statut")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<List<JobRequisitionDto.Response>> getRequisitionsByStatus(
            @PathVariable RequisitionStatus status) {

        log.info("Retrieving requisitions with status: {}", status);
        List<JobRequisitionDto.Response> requisitions = requisitionService.getRequisitionsByStatus(status);
        log.info("Found {} requisitions with status: {}", requisitions.size(), status);

        return ResponseEntity.ok(requisitions);
    }
}