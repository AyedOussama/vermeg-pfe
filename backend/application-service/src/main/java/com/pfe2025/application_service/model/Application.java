package com.pfe2025.application_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "applications")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Application extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String reference;

    @Column(nullable = false)
    @NotNull
    private String candidateId;

    @Column(nullable = false)
    @NotNull
    private Long jobPostingId;

    private Long resumeDocumentId;

    private Long coverLetterDocumentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private ApplicationStatus status;

    @Column(columnDefinition = "TEXT")
    private String recruiterNotes;

    @Column(columnDefinition = "TEXT")
    private String candidateMessage;

    // Denormalized fields to avoid excessive service calls
    private String jobTitle;

    private String jobDepartment;

    private String candidateName;

    private Boolean aiProcessed;

    private Double aiScore;

    private Boolean autoDecision;

    private Boolean isShortlisted;

    // Fields for interview integration
    private Long interviewId;

    private LocalDateTime interviewRequestedAt;

    private LocalDateTime submittedAt;

    private LocalDateTime processedAt;

    private LocalDateTime lastStatusChangedAt;

    private String lastStatusChangedBy;

    @Builder.Default
    private Boolean deleted = false;

    @OneToOne(mappedBy = "application", cascade = jakarta.persistence.CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    private Evaluation evaluation;

    @OneToMany(mappedBy = "application", cascade = jakarta.persistence.CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ApplicationStatusHistory> statusHistory = new HashSet<>();

    /**
     * Adds a status history entry.
     */
    public Application addStatusHistoryEntry(ApplicationStatus previousStatus, ApplicationStatus newStatus,
                                             String changedBy, String reason) {
        ApplicationStatusHistory historyEntry = ApplicationStatusHistory.builder()
                .application(this)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .reason(reason)
                .changedAt(LocalDateTime.now())
                .build();

        this.statusHistory.add(historyEntry);
        return this;
    }

    /**
     * Application status enum
     */
    public enum ApplicationStatus {
        SUBMITTED,
        UNDER_REVIEW,
        SHORTLISTED,
        INTERVIEW_REQUESTED,
        INTERVIEW_SCHEDULED,
        INTERVIEW_COMPLETED,
        OFFER_EXTENDED,
        HIRED,
        REJECTED,
        WITHDRAWN
    }
}