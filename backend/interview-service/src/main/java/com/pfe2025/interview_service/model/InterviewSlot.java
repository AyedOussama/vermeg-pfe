package com.pfe2025.interview_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_slots")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSlot extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(nullable = false)
    @NotNull
    private LocalDateTime startDateTime;

    @Column(nullable = false)
    @NotNull
    private LocalDateTime endDateTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private SlotFormat format;

    private String location;
    private String meetingLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private SlotStatus status;

    private String googleCalendarEventId;

    @Column(columnDefinition = "TEXT")
    private String participants; // JSON list of participant identifiers

    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    private LocalDateTime canceledAt;
    private String canceledBy;

    public enum SlotFormat {
        VIRTUAL,
        IN_PERSON,
        PHONE
    }

    public enum SlotStatus {
        PROPOSED,
        SELECTED,
        CONFIRMED,
        DECLINED,
        EXPIRED,
        CANCELED
    }
}