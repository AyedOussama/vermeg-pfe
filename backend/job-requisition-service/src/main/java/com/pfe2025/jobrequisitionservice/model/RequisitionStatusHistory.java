package com.pfe2025.jobrequisitionservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entité représentant l'historique des changements de statut d'une réquisition.
 * Chaque changement de statut est enregistré avec des informations sur qui a effectué
 * le changement, quand, et pourquoi.
 */
@Entity
@Table(name = "requisition_status_history", indexes = {
        @Index(name = "idx_history_requisition_id", columnList = "requisition_id"),
        @Index(name = "idx_history_changed_at", columnList = "changed_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = "requisition")
public class RequisitionStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    private JobRequisition requisition;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 20)
    private RequisitionStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 20)
    private RequisitionStatus newStatus;

    @Column(name = "changed_by", nullable = false, length = 255)
    private String changedBy;

    @Column(name = "changed_by_name", length = 255)
    private String changedByName;

    @Column(name = "comments", length = 1000)
    @Size(max = 1000)
    private String comments;

    @CreationTimestamp
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;
}