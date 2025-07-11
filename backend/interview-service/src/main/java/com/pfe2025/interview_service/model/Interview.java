package com.pfe2025.interview_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Interview extends BaseEntity {

    @Column(nullable = false)
    @NotNull
    private Long applicationId;

    @Column(nullable = false)
    @NotNull
    private String applicationReference;

    @Column(nullable = false)
    @NotNull
    private String candidateId;

    @Column(nullable = false)
    @NotNull
    private String candidateName;

    @Column(nullable = false)
    @NotNull
    private Long jobPostingId;

    private String jobTitle;
    private String jobDepartment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private InterviewStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private InterviewType type;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long selectedSlotId;
    private LocalDateTime scheduledAt;
    private String format;
    private String location;
    private String meetingLink;
    private String googleCalendarEventId;

    private Double overallScore;
    @Column(columnDefinition = "TEXT")
    private String feedbackSummary;
    private Boolean isRecommended;

    private LocalDateTime completedAt;
    private LocalDateTime canceledAt;
    @Column(columnDefinition = "TEXT")
    private String cancellationReason;
    private String canceledBy;

    @Builder.Default
    private Boolean deleted = false;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<InterviewSlot> slots = new HashSet<>();

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<InterviewParticipant> participants = new HashSet<>();

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<InterviewFeedback> feedbacks = new HashSet<>();

    public Interview addStatusHistoryEntry(InterviewStatus previousStatus, InterviewStatus newStatus,
                                           String changedBy, String reason) {
        // Implementation can be added later if needed
        return this;
    }

    public enum InterviewStatus {
        REQUESTED,
        SLOTS_PROPOSED,
        SLOT_SELECTED,
        SCHEDULED,
        COMPLETED,
        CANCELED,
        NO_SHOW
    }

    public enum InterviewType {
        SCREENING,
        TECHNICAL,
        HR,
        MANAGER,
        FINAL
    }
}