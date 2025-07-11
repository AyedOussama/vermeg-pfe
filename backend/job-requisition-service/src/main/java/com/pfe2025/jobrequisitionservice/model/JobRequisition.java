package com.pfe2025.jobrequisitionservice.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité représentant un besoin de recrutement.
 * Contient toutes les informations nécessaires pour une demande de recrutement.
 */
@Entity
@Table(name = "job_requisitions", indexes = {
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_department", columnList = "department"),
        @Index(name = "idx_project_leader", columnList = "project_leader_id"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"statusHistory", "requiredSkills"})
@EqualsAndHashCode(of = "id")
public class JobRequisition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    @Size(min = 3, max = 255)
    private String title;

    @Column(nullable = false, length = 2000)
    @Size(min = 10, max = 2000)
    private String description;

    @Column(nullable = false, length = 255)
    private String department;

    @Column(name = "project_name", length = 255)
    private String projectName;

    @Column(name = "project_leader_id", nullable = false, length = 255)
    private String projectLeaderId;

    @Column(name = "project_leader_name", length = 255)
    private String projectLeaderName;

    @Column(name = "required_level", nullable = false, columnDefinition = "job_level")
    @Enumerated(EnumType.STRING) // Garde l'instruction d'envoyer le nom de l'enum comme String
    private JobLevel requiredLevel;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_requisition_skills", joinColumns = @JoinColumn(name = "requisition_id"))
    @Column(name = "skill", length = 100)
    @Size(max = 10) // Limite le nombre de compétences
    @Builder.Default
    private Set<@Size(min = 2, max = 50) String> requiredSkills = new HashSet<>();

    @Column(name = "min_experience")
    @Min(0)
    private Integer minExperience;

    @Column(name = "expected_start_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @FutureOrPresent
    private LocalDate expectedStartDate;

    @Column(name = "is_urgent")
    private Boolean urgent;

    @Column(name = "needed_headcount")
    @Min(1)
    private Integer neededHeadcount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RequisitionStatus status;

    @Column(name = "ceo_id", length = 255)
    private String ceoId;

    @Column(name = "ceo_response_date")
    private LocalDateTime ceoResponseDate;

    @Column(name = "rejection_reason", length = 1000)
    @Size(max = 1000)
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "requisition", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<RequisitionStatusHistory> statusHistory = new HashSet<>();

    /**
     * Méthode utilitaire pour ajouter une entrée à l'historique des statuts.
     *
     * @param history L'entrée d'historique à ajouter
     */
    public void addStatusHistory(RequisitionStatusHistory history) {
        history.setRequisition(this);
        this.statusHistory.add(history);
    }
}