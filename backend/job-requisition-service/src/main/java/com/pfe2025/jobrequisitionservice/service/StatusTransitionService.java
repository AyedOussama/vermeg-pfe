package com.pfe2025.jobrequisitionservice.service;

import com.pfe2025.jobrequisitionservice.exception.StatusTransitionException;
import com.pfe2025.jobrequisitionservice.model.RequisitionStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service responsable de la gestion des transitions de statut
 * pour les réquisitions de poste. Implémente une machine à états
 * qui définit les transitions autorisées.
 */
@Service
@Slf4j
public class StatusTransitionService {

    private final Map<RequisitionStatus, Set<RequisitionStatus>> allowedTransitions;

    /**
     * Initialise la machine à états avec les transitions autorisées.
     */
    public StatusTransitionService() {
        this.allowedTransitions = new EnumMap<>(RequisitionStatus.class);

        // Initialiser la matrice de transitions autorisées
        allowedTransitions.put(RequisitionStatus.DRAFT, Set.of(
                RequisitionStatus.SUBMITTED, RequisitionStatus.CANCELLED));

        allowedTransitions.put(RequisitionStatus.SUBMITTED, Set.of(
                RequisitionStatus.APPROVED, RequisitionStatus.REJECTED, RequisitionStatus.CANCELLED));

        allowedTransitions.put(RequisitionStatus.APPROVED, Set.of(
                RequisitionStatus.IN_PROGRESS, RequisitionStatus.CANCELLED, RequisitionStatus.CLOSED));

        allowedTransitions.put(RequisitionStatus.REJECTED, Set.of(
                RequisitionStatus.DRAFT, RequisitionStatus.CLOSED));

        allowedTransitions.put(RequisitionStatus.IN_PROGRESS, Set.of(
                RequisitionStatus.FULFILLED, RequisitionStatus.CANCELLED, RequisitionStatus.CLOSED));

        allowedTransitions.put(RequisitionStatus.FULFILLED, Set.of(
                RequisitionStatus.CLOSED));

        allowedTransitions.put(RequisitionStatus.CANCELLED, Set.of(
                RequisitionStatus.CLOSED));

        // CLOSED est un état terminal
        allowedTransitions.put(RequisitionStatus.CLOSED, Collections.emptySet());
    }

    /**
     * Vérifie si une transition est autorisée.
     *
     * @param currentStatus Le statut actuel
     * @param targetStatus Le statut cible
     * @return true si la transition est autorisée, false sinon
     */
    public boolean isTransitionAllowed(RequisitionStatus currentStatus, RequisitionStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return true;  // Même état, autorisé
        }

        Set<RequisitionStatus> allowed = allowedTransitions.get(currentStatus);
        return allowed != null && allowed.contains(targetStatus);
    }

    /**
     * Valide une transition et lève une exception si elle n'est pas autorisée.
     *
     * @param currentStatus Le statut actuel
     * @param targetStatus Le statut cible
     * @throws StatusTransitionException si la transition n'est pas autorisée
     */
    public void validateTransition(RequisitionStatus currentStatus, RequisitionStatus targetStatus) {
        if (!isTransitionAllowed(currentStatus, targetStatus)) {
            log.error("Transition non autorisée de {} vers {}", currentStatus, targetStatus);
            throw new StatusTransitionException(
                    String.format("Transition non autorisée de %s vers %s", currentStatus, targetStatus));
        }
    }

    /**
     * Génère un commentaire par défaut pour une transition de statut.
     *
     * @param oldStatus L'ancien statut
     * @param newStatus Le nouveau statut
     * @return Un commentaire descriptif de la transition
     */
    public String getDefaultComment(RequisitionStatus oldStatus, RequisitionStatus newStatus) {
        switch (newStatus) {
            case SUBMITTED:
                return "Réquisition soumise pour approbation";
            case APPROVED:
                return "Réquisition approuvée par le CEO";
            case REJECTED:
                return "Réquisition rejetée par le CEO";
            case IN_PROGRESS:
                return "Recrutement en cours pour cette réquisition";
            case FULFILLED:
                return "Tous les postes de cette réquisition ont été pourvus";
            case CANCELLED:
                return "Réquisition annulée";
            case CLOSED:
                return "Réquisition clôturée";
            case DRAFT:
                return "Réquisition retournée à l'état brouillon";
            default:
                return String.format("Transition de %s vers %s", oldStatus, newStatus);
        }
    }
}