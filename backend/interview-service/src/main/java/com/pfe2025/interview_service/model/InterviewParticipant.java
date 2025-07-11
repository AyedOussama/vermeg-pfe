package com.pfe2025.interview_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "interview_participants")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewParticipant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    private InterviewSlot slot;

    @Column(nullable = false)
    @NotNull
    private String userId;

    @Column(nullable = false)
    @NotNull
    private String userEmail;

    @Column(nullable = false)
    @NotNull
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private ParticipantRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private ParticipantStatus status;

    private Boolean isOrganizer;
    private Boolean isRequired;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum ParticipantRole {
        INTERVIEWER,
        CANDIDATE,
        OBSERVER,
        COORDINATOR
    }

    public enum ParticipantStatus {
        INVITED,
        ACCEPTED,
        DECLINED,
        TENTATIVE
    }
}