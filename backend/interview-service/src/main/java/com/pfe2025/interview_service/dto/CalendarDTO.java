package com.pfe2025.interview_service.dto;

import com.pfe2025.interview_service.model.CalendarIntegration;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTOs for Calendar Integration operations.
 */
public class CalendarDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectRequest {
        private String authorizationCode;
        private CalendarIntegration.CalendarProvider provider;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectResponse {
        private Long id;
        private CalendarIntegration.CalendarProvider provider;
        private String userEmail;
        private String calendarId;
        private Boolean isActive;
        private LocalDateTime connectedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalendarEventRequest {
        private String summary;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String location;
        private java.util.List<String> attendeeEmails;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalendarEventResponse {
        private String eventId;
        private String summary;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String location;
        private String status;
        private java.util.List<AttendeeStatus> attendees;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendeeStatus {
        private String email;
        private String status; // ACCEPTED, DECLINED, TENTATIVE, NEEDS_ACTION
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalendarSettings {
        private Boolean autoCreateEvents;
        private Boolean sendInvitations;
        private String defaultLocation;
        private Integer defaultDuration;
        private Boolean enableReminders;
        private java.util.List<ReminderSettings> reminders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReminderSettings {
        private String method; // EMAIL, POPUP
        private Integer minutesBefore;
    }
}