package com.pfe2025.interview_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe2025.interview_service.model.Interview;
import com.pfe2025.interview_service.model.InterviewParticipant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for sending notifications related to interviews.
 * Note: This is a placeholder service for sending notifications.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final ObjectMapper objectMapper;

    @Async("notificationTaskExecutor")
    public void sendInterviewRequestedNotification(Interview interview) {
        log.info("NOTIFICATION: Interview requested for candidate: {}, reference: {}",
                interview.getCandidateName(), interview.getApplicationReference());

        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("type", "INTERVIEW_REQUESTED");
        notificationData.put("recipient", interview.getCandidateId());
        notificationData.put("interviewId", interview.getId());
        notificationData.put("applicationId", interview.getApplicationId());
        notificationData.put("jobTitle", interview.getJobTitle());

        try {
            log.debug("Notification data: {}", objectMapper.writeValueAsString(notificationData));
            // In a real implementation, this would call a notification service
        } catch (JsonProcessingException e) {
            log.error("Error serializing notification data", e);
        }
    }

    @Async("notificationTaskExecutor")
    public void sendSlotsProposedNotification(Interview interview, List<LocalDateTime> slots) {
        log.info("NOTIFICATION: Slots proposed for candidate: {}, count: {}",
                interview.getCandidateName(), slots.size());

        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("type", "SLOTS_PROPOSED");
        notificationData.put("recipient", interview.getCandidateId());
        notificationData.put("interviewId", interview.getId());
        notificationData.put("applicationId", interview.getApplicationId());
        notificationData.put("jobTitle", interview.getJobTitle());
        notificationData.put("slotCount", slots.size());

        try {
            log.debug("Notification data: {}", objectMapper.writeValueAsString(notificationData));
            // In a real implementation, this would call a notification service
        } catch (JsonProcessingException e) {
            log.error("Error serializing notification data", e);
        }
    }

    @Async("notificationTaskExecutor")
    public void sendInterviewScheduledNotification(Interview interview) {
        log.info("NOTIFICATION: Interview scheduled for candidate: {}, date: {}",
                interview.getCandidateName(), interview.getScheduledAt());

        // Notify candidate
        Map<String, Object> candidateNotification = new HashMap<>();
        candidateNotification.put("type", "INTERVIEW_SCHEDULED");
        candidateNotification.put("recipient", interview.getCandidateId());
        candidateNotification.put("interviewId", interview.getId());
        candidateNotification.put("applicationId", interview.getApplicationId());
        candidateNotification.put("jobTitle", interview.getJobTitle());
        candidateNotification.put("scheduledAt", interview.getScheduledAt());
        candidateNotification.put("format", interview.getFormat());
        candidateNotification.put("location", interview.getLocation());

        try {
            log.debug("Notification data: {}", objectMapper.writeValueAsString(candidateNotification));
            // In a real implementation, this would call a notification service
        } catch (JsonProcessingException e) {
            log.error("Error serializing notification data", e);
        }

        // Notify participants
        for (InterviewParticipant participant : interview.getParticipants()) {
            if (participant.getRole() == InterviewParticipant.ParticipantRole.INTERVIEWER) {
                Map<String, Object> participantNotification = new HashMap<>(candidateNotification);
                participantNotification.put("recipient", participant.getUserId());

                try {
                    log.debug("Participant notification data: {}",
                            objectMapper.writeValueAsString(participantNotification));
                    // In a real implementation, this would call a notification service
                } catch (JsonProcessingException e) {
                    log.error("Error serializing notification data", e);
                }
            }
        }
    }

    @Async("notificationTaskExecutor")
    public void sendInterviewCanceledNotification(Interview interview, String reason) {
        log.info("NOTIFICATION: Interview canceled for candidate: {}, reason: {}",
                interview.getCandidateName(), reason);

        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("type", "INTERVIEW_CANCELED");
        notificationData.put("recipient", interview.getCandidateId());
        notificationData.put("interviewId", interview.getId());
        notificationData.put("applicationId", interview.getApplicationId());
        notificationData.put("jobTitle", interview.getJobTitle());
        notificationData.put("reason", reason);

        try {
            log.debug("Notification data: {}", objectMapper.writeValueAsString(notificationData));
            // In a real implementation, this would call a notification service
        } catch (JsonProcessingException e) {
            log.error("Error serializing notification data", e);
        }
    }

    @Async("notificationTaskExecutor")
    public void sendFeedbackRequestNotification(Interview interview, String recipientId) {
        log.info("NOTIFICATION: Feedback request for interview: {}, recipient: {}",
                interview.getId(), recipientId);

        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("type", "FEEDBACK_REQUEST");
        notificationData.put("recipient", recipientId);
        notificationData.put("interviewId", interview.getId());
        notificationData.put("applicationId", interview.getApplicationId());
        notificationData.put("candidateName", interview.getCandidateName());
        notificationData.put("jobTitle", interview.getJobTitle());

        try {
            log.debug("Notification data: {}", objectMapper.writeValueAsString(notificationData));
            // In a real implementation, this would call a notification service
        } catch (JsonProcessingException e) {
            log.error("Error serializing notification data", e);
        }
    }

    @Scheduled(cron = "${app.scheduler.interview-reminder-cron}")
    public void sendInterviewReminders() {
        log.debug("Sending interview reminders");

        // In a real implementation, this would query upcoming interviews and send reminders
        // For example:
        // List<Interview> upcomingInterviews = interviewRepository.findUpcomingInterviews(
        //         Interview.InterviewStatus.SCHEDULED, LocalDateTime.now().plusDays(1));

        // for (Interview interview : upcomingInterviews) {
        //     sendInterviewReminderNotification(interview);
        // }
    }

    @Async("notificationTaskExecutor")
    public void sendInterviewReminderNotification(Interview interview) {
        log.info("NOTIFICATION: Interview reminder for candidate: {}, scheduled: {}",
                interview.getCandidateName(), interview.getScheduledAt());

        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("type", "INTERVIEW_REMINDER");
        notificationData.put("recipient", interview.getCandidateId());
        notificationData.put("interviewId", interview.getId());
        notificationData.put("applicationId", interview.getApplicationId());
        notificationData.put("jobTitle", interview.getJobTitle());
        notificationData.put("scheduledAt", interview.getScheduledAt());
        notificationData.put("format", interview.getFormat());
        notificationData.put("location", interview.getLocation());

        try {
            log.debug("Notification data: {}", objectMapper.writeValueAsString(notificationData));
            // In a real implementation, this would call a notification service
        } catch (JsonProcessingException e) {
            log.error("Error serializing notification data", e);
        }
    }
}