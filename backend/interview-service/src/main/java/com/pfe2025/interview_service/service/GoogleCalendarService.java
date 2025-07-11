package com.pfe2025.interview_service.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import com.pfe2025.interview_service.dto.CalendarDTO;
import com.pfe2025.interview_service.exception.CalendarIntegrationException;
import com.pfe2025.interview_service.model.CalendarIntegration;
import com.pfe2025.interview_service.model.Interview;
import com.pfe2025.interview_service.model.InterviewParticipant;
import com.pfe2025.interview_service.model.InterviewSlot;
import com.pfe2025.interview_service.repository.CalendarIntegrationRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.StringReader;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarService {

    private final CalendarIntegrationRepository calendarIntegrationRepository;

    @Value("${app.google.calendar.client-id}")
    private String clientId;

    @Value("${app.google.calendar.client-secret}")
    private String clientSecret;

    @Value("${app.google.calendar.redirect-uri}")
    private String redirectUri;

    @Value("${app.google.calendar.scope}")
    private String scope;

    @Value("${app.google.calendar.application-name}")
    private String applicationName;

    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    /**
     * Creates a calendar event for a scheduled interview.
     */
    @CircuitBreaker(name = "googleCalendarClient", fallbackMethod = "createCalendarEventFallback")
    @Retry(name = "googleCalendarClient")
    public String createCalendarEvent(Interview interview, InterviewSlot slot,
                                      List<InterviewParticipant> participants) {
        log.debug("Creating Google Calendar event for interview {}", interview.getId());

        try {
            Calendar service = getCalendarService(interview.getCandidateId());

            Event event = new Event()
                    .setSummary("Entretien: " + interview.getJobTitle() + " - " + interview.getCandidateName())
                    .setDescription(buildEventDescription(interview, slot));

            // Setup dates and times
            DateTime startDateTime = new DateTime(
                    slot.getStartDateTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            EventDateTime start = new EventDateTime()
                    .setDateTime(startDateTime)
                    .setTimeZone("UTC");
            event.setStart(start);

            DateTime endDateTime = new DateTime(
                    slot.getEndDateTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            EventDateTime end = new EventDateTime()
                    .setDateTime(endDateTime)
                    .setTimeZone("UTC");
            event.setEnd(end);

            // Add participants
            List<EventAttendee> attendees = participants.stream()
                    .map(participant -> new EventAttendee()
                            .setEmail(participant.getUserEmail())
                            .setDisplayName(participant.getUserName()))
                    .collect(Collectors.toList());
            event.setAttendees(attendees);

            // Add location
            if (slot.getLocation() != null && !slot.getLocation().isBlank()) {
                if (slot.getFormat() == InterviewSlot.SlotFormat.VIRTUAL) {
                    event.setConferenceData(createConferenceData(slot.getMeetingLink()));
                } else {
                    event.setLocation(slot.getLocation());
                }
            }

            // Add reminders
            Event.Reminders reminders = new Event.Reminders()
                    .setUseDefault(false)
                    .setOverrides(Arrays.asList(
                            new EventReminder().setMethod("email").setMinutes(24 * 60),
                            new EventReminder().setMethod("popup").setMinutes(60)
                    ));
            event.setReminders(reminders);

            // Create the event
            event = service.events().insert("primary", event).execute();

            log.info("Created Google Calendar event with ID: {} for interview: {}",
                    event.getId(), interview.getId());

            return event.getId();

        } catch (Exception e) {
            log.error("Failed to create Google Calendar event: {}", e.getMessage(), e);
            throw new CalendarIntegrationException("Failed to create calendar event", e);
        }
    }

    /**
     * Creates a provisional calendar event for an interview slot.
     */
    @CircuitBreaker(name = "googleCalendarClient", fallbackMethod = "createProvisionalEventFallback")
    @Retry(name = "googleCalendarClient")
    public String createProvisionalEvent(Interview interview, InterviewSlot slot) {
        log.debug("Creating provisional Google Calendar event for interview {}, slot {}",
                interview.getId(), slot.getId());

        try {
            Calendar service = getCalendarService(interview.getCandidateId());

            Event event = new Event()
                    .setSummary("[Provisoire] Créneau d'entretien: " + interview.getJobTitle())
                    .setDescription("Créneau provisoire pour entretien - en attente de confirmation\n\n" +
                            buildEventDescription(interview, slot));

            // Setup dates and times
            DateTime startDateTime = new DateTime(
                    slot.getStartDateTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            EventDateTime start = new EventDateTime()
                    .setDateTime(startDateTime)
                    .setTimeZone("UTC");
            event.setStart(start);

            DateTime endDateTime = new DateTime(
                    slot.getEndDateTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            EventDateTime end = new EventDateTime()
                    .setDateTime(endDateTime)
                    .setTimeZone("UTC");
            event.setEnd(end);

            // Set status as tentative
            event.setStatus("tentative");

            // Add location/format
            if (slot.getLocation() != null && !slot.getLocation().isBlank()) {
                if (slot.getFormat() == InterviewSlot.SlotFormat.VIRTUAL) {
                    event.setConferenceData(createConferenceData(slot.getMeetingLink()));
                } else {
                    event.setLocation(slot.getLocation());
                }
            }

            // Create the event
            event = service.events().insert("primary", event).execute();

            log.info("Created provisional Google Calendar event with ID: {} for slot: {}",
                    event.getId(), slot.getId());

            return event.getId();

        } catch (Exception e) {
            log.error("Failed to create provisional Google Calendar event: {}", e.getMessage(), e);
            throw new CalendarIntegrationException("Failed to create provisional calendar event", e);
        }
    }

    /**
     * Confirms a provisional calendar event.
     */
    @CircuitBreaker(name = "googleCalendarClient", fallbackMethod = "confirmCalendarEventFallback")
    @Retry(name = "googleCalendarClient")
    public void confirmCalendarEvent(String eventId) {
        log.debug("Confirming Google Calendar event {}", eventId);

        try {
            // We need to get the user ID associated with this event
            // In a real impl, you'd retrieve this information
            String userId = getUserIdFromEventId(eventId);

            Calendar service = getCalendarService(userId);

            // Get the event
            Event event = service.events().get("primary", eventId).execute();

            // Update the title (remove provisional tag)
            if (event.getSummary().startsWith("[Provisoire]")) {
                event.setSummary(event.getSummary().replace("[Provisoire] ", ""));
            }

            // Update the description
            if (event.getDescription().startsWith("Créneau provisoire")) {
                event.setDescription(event.getDescription().replace(
                        "Créneau provisoire pour entretien - en attente de confirmation\n\n", ""));
            }

            // Set status as confirmed
            event.setStatus("confirmed");

            // Update the event
            service.events().update("primary", eventId, event).execute();

            log.info("Confirmed Google Calendar event {}", eventId);

        } catch (Exception e) {
            log.error("Failed to confirm Google Calendar event: {}", e.getMessage(), e);
            throw new CalendarIntegrationException("Failed to confirm calendar event", e);
        }
    }

    /**
     * Updates an existing calendar event.
     */
    @CircuitBreaker(name = "googleCalendarClient", fallbackMethod = "updateCalendarEventFallback")
    @Retry(name = "googleCalendarClient")
    public void updateCalendarEvent(String eventId, Interview interview, InterviewSlot slot,
                                    List<InterviewParticipant> participants) {
        log.debug("Updating Google Calendar event {} for interview {}", eventId, interview.getId());

        try {
            Calendar service = getCalendarService(interview.getCandidateId());

            Event event = service.events().get("primary", eventId).execute();

            // Update details
            event.setSummary("Entretien: " + interview.getJobTitle() + " - " + interview.getCandidateName());
            event.setDescription(buildEventDescription(interview, slot));

            // Update dates
            DateTime startDateTime = new DateTime(
                    slot.getStartDateTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            event.getStart().setDateTime(startDateTime);

            DateTime endDateTime = new DateTime(
                    slot.getEndDateTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            event.getEnd().setDateTime(endDateTime);

            // Update participants
            List<EventAttendee> attendees = participants.stream()
                    .map(participant -> new EventAttendee()
                            .setEmail(participant.getUserEmail())
                            .setDisplayName(participant.getUserName()))
                    .collect(Collectors.toList());
            event.setAttendees(attendees);

            // Update the event
            service.events().update("primary", eventId, event).execute();

            log.info("Updated Google Calendar event {} for interview {}", eventId, interview.getId());

        } catch (Exception e) {
            log.error("Failed to update Google Calendar event: {}", e.getMessage(), e);
            throw new CalendarIntegrationException("Failed to update calendar event", e);
        }
    }

    /**
     * Cancels a calendar event.
     */
    @CircuitBreaker(name = "googleCalendarClient", fallbackMethod = "cancelCalendarEventFallback")
    @Retry(name = "googleCalendarClient")
    public void cancelCalendarEvent(String eventId, String userId) {
        log.debug("Canceling Google Calendar event {}", eventId);

        if (eventId == null || eventId.startsWith("fallback_")) {
            log.debug("Skipping cancel for fallback event ID: {}", eventId);
            return;
        }

        try {
            Calendar service = getCalendarService(userId);

            // Update the event to cancel it
            Event event = service.events().get("primary", eventId).execute();
            event.setStatus("cancelled");

            service.events().update("primary", eventId, event).execute();

            log.info("Canceled Google Calendar event {}", eventId);

        } catch (Exception e) {
            log.error("Failed to cancel Google Calendar event: {}", e.getMessage(), e);
            throw new CalendarIntegrationException("Failed to cancel calendar event", e);
        }
    }

    /**
     * Connects a user's Google Calendar.
     */
    public CalendarDTO.ConnectResponse connectGoogleCalendar(String userId, String authorizationCode) {
        log.debug("Connecting Google Calendar for user {}", userId);

        try {
            // Exchange authorization code for tokens
            GoogleAuthorizationCodeFlow flow = createGoogleAuthorizationCodeFlow();
            TokenResponse tokenResponse = flow.newTokenRequest(authorizationCode)
                    .setRedirectUri(redirectUri)
                    .execute();


            Credential credential = flow.createAndStoreCredential(tokenResponse, userId);



            // Save the integration
            CalendarIntegration integration = CalendarIntegration.builder()
                    .userId(userId)
                    .provider(CalendarIntegration.CalendarProvider.GOOGLE)
                    .accessToken(credential.getAccessToken())
                    .refreshToken(credential.getRefreshToken())
                    .tokenExpiryDate(LocalDateTime.now().plusSeconds(credential.getExpiresInSeconds()))
                    .userEmail(getUserEmail(credential))
                    .calendarId("primary")
                    .isActive(true)
                    .lastSyncDate(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .createdBy(userId)
                    .build();

            integration = calendarIntegrationRepository.save(integration);

            return CalendarDTO.ConnectResponse.builder()
                    .id(integration.getId())
                    .provider(integration.getProvider())
                    .userEmail(integration.getUserEmail())
                    .calendarId(integration.getCalendarId())
                    .isActive(integration.getIsActive())
                    .connectedAt(integration.getCreatedAt())
                    .build();

        } catch (Exception e) {
            log.error("Failed to connect Google Calendar: {}", e.getMessage(), e);
            throw new CalendarIntegrationException("Failed to connect Google Calendar", e);
        }
    }

    // Utility private methods

    private Calendar getCalendarService(String userId) throws Exception {
        CalendarIntegration integration = calendarIntegrationRepository.findByUserId(userId)
                .orElseThrow(() -> new CalendarIntegrationException("No calendar integration found for user: " + userId));

        GoogleAuthorizationCodeFlow flow = createGoogleAuthorizationCodeFlow();
        Credential credential = flow.createAndStoreCredential(null, integration.getUserEmail());

        // Check if token needs refresh
        if (integration.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            credential.refreshToken();

            // Update tokens in database
            integration.setAccessToken(credential.getAccessToken());
            integration.setRefreshToken(credential.getRefreshToken());
            integration.setTokenExpiryDate(LocalDateTime.now().plusSeconds(credential.getExpiresInSeconds()));
            calendarIntegrationRepository.save(integration);
        }

        return new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                credential)
                .setApplicationName(applicationName)
                .build();
    }

    private GoogleAuthorizationCodeFlow createGoogleAuthorizationCodeFlow() throws Exception {
        GoogleClientSecrets.Details clientDetails = new GoogleClientSecrets.Details()
                .setClientId(clientId)
                .setClientSecret(clientSecret);

        GoogleClientSecrets clientSecrets = new GoogleClientSecrets()
                .setInstalled(clientDetails);

        return new GoogleAuthorizationCodeFlow.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                clientSecrets,
                Arrays.asList(scope.split(",")))
                .setDataStoreFactory(new FileDataStoreFactory(new java.io.File("tokens")))
                .setAccessType("offline")
                .build();
    }

    private String buildEventDescription(Interview interview, InterviewSlot slot) {
        StringBuilder desc = new StringBuilder();
        desc.append("Entretien pour le poste: ").append(interview.getJobTitle()).append("\n");
        desc.append("Candidat: ").append(interview.getCandidateName()).append("\n");
        desc.append("Format: ").append(slot.getFormat()).append("\n");

        if (interview.getDescription() != null) {
            desc.append("\nDescription: ").append(interview.getDescription());
        }

        return desc.toString();
    }

    private ConferenceData createConferenceData(String meetingLink) {
        ConferenceSolutionKey conferenceSolutionKey = new ConferenceSolutionKey();
        conferenceSolutionKey.setType("addOn");

        CreateConferenceRequest createConferenceRequest = new CreateConferenceRequest();
        createConferenceRequest.setConferenceSolutionKey(conferenceSolutionKey);
        createConferenceRequest.setRequestId(java.util.UUID.randomUUID().toString());

        return new ConferenceData().setCreateRequest(createConferenceRequest);
    }

    private String getUserEmail(Credential credential) {
        try {
            // In a real implementation, you would use the credential to call the Google userinfo API
            // For simplicity, we'll return a placeholder value
            return "user@example.com";
        } catch (Exception e) {
            log.error("Error retrieving user email", e);
            return "unknown@example.com";
        }
    }

    private String getUserIdFromEventId(String eventId) {
        // In a real implementation, you would look up which user created this event
        // For simplicity, we'll return a placeholder value
        return "default-user-id";
    }

    // Fallback methods

    public String createCalendarEventFallback(Interview interview, InterviewSlot slot,
                                              List<InterviewParticipant> participants, Exception ex) {
        log.warn("Fallback for Google Calendar event creation. Interview: {}, Error: {}",
                interview.getId(), ex.getMessage());
        return "fallback_" + System.currentTimeMillis();
    }

    public String createProvisionalEventFallback(Interview interview, InterviewSlot slot, Exception ex) {
        log.warn("Fallback for provisional Google Calendar event creation. Interview: {}, Slot: {}, Error: {}",
                interview.getId(), slot.getId(), ex.getMessage());
        return "fallback_prov_" + System.currentTimeMillis();
    }

    public void updateCalendarEventFallback(String eventId, Interview interview, InterviewSlot slot,
                                            List<InterviewParticipant> participants, Exception ex) {
        log.warn("Fallback for Google Calendar event update. Event: {}, Error: {}",
                eventId, ex.getMessage());
    }

    public void confirmCalendarEventFallback(String eventId, Exception ex) {
        log.warn("Fallback for Google Calendar event confirmation. Event: {}, Error: {}",
                eventId, ex.getMessage());
    }

    public void cancelCalendarEventFallback(String eventId, String userId, Exception ex) {
        log.warn("Fallback for Google Calendar event cancellation. Event: {}, Error: {}",
                eventId, ex.getMessage());
    }
}