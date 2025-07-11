package com.pfe2025.interview_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "calendar_integrations")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarIntegration extends BaseEntity {

    @Column(nullable = false, unique = true)
    @NotNull
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    @Builder.Default
    private CalendarProvider provider = CalendarProvider.GOOGLE;

    @Column(columnDefinition = "TEXT")
    private String accessToken;

    @Column(columnDefinition = "TEXT")
    private String refreshToken;

    private LocalDateTime tokenExpiryDate;
    private String calendarId;
    private String userEmail;

    @Column(columnDefinition = "TEXT")
    private String settings;

    @Builder.Default
    private Boolean isActive = true;

    private LocalDateTime lastSyncDate;

    public enum CalendarProvider {
        GOOGLE,
        OUTLOOK,
        APPLE
    }
}