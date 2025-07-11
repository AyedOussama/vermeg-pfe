package com.pfe2025.application_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe2025.application_service.dto.NotificationRequestDTO;
import com.pfe2025.application_service.model.Application;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Service temporaire pour la gestion des notifications.
 * Sera remplacé par un appel au microservice Notification-Service quand il sera disponible.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final ObjectMapper objectMapper;

    /**
     * Envoie une notification de soumission de candidature.
     *
     * @param application La candidature soumise
     */
    public void sendApplicationSubmittedNotification(Application application) {
        log.info("NOTIFICATION: Application submitted - Reference: {}, Candidate: {}, Job: {}",
                application.getReference(),
                application.getCandidateName(),
                application.getJobTitle());

        try {
            // Construire la notification
            NotificationRequestDTO notification = buildEmailNotification(
                    application.getCandidateId(),
                    "Votre candidature a été soumise avec succès",
                    "application_submitted",
                    Map.of(
                            "candidateName", application.getCandidateName(),
                            "jobTitle", application.getJobTitle(),
                            "reference", application.getReference()
                    )
            );

            // Loguer la notification (à remplacer par un appel au service de notification)
            log.debug("Notification details: {}", objectMapper.writeValueAsString(notification));

        } catch (Exception e) {
            log.error("Error sending application submitted notification: {}", e.getMessage());
        }
    }

    /**
     * Envoie une notification de présélection de candidature.
     *
     * @param application La candidature présélectionnée
     */
    public void sendApplicationShortlistedNotification(Application application) {
        log.info("NOTIFICATION: Application shortlisted - Reference: {}, Candidate: {}, Job: {}",
                application.getReference(),
                application.getCandidateName(),
                application.getJobTitle());

        try {
            // Construire la notification
            NotificationRequestDTO notification = buildEmailNotification(
                    application.getCandidateId(),
                    "Félicitations ! Votre candidature a été présélectionnée",
                    "application_shortlisted",
                    Map.of(
                            "candidateName", application.getCandidateName(),
                            "jobTitle", application.getJobTitle(),
                            "reference", application.getReference()
                    )
            );

            // Loguer la notification (à remplacer par un appel au service de notification)
            log.debug("Notification details: {}", objectMapper.writeValueAsString(notification));

        } catch (Exception e) {
            log.error("Error sending application shortlisted notification: {}", e.getMessage());
        }
    }

    /**
     * Envoie une notification de rejet de candidature.
     *
     * @param application La candidature rejetée
     */
    public void sendApplicationRejectedNotification(Application application) {
        log.info("NOTIFICATION: Application rejected - Reference: {}, Candidate: {}, Job: {}",
                application.getReference(),
                application.getCandidateName(),
                application.getJobTitle());

        try {
            // Construire la notification
            NotificationRequestDTO notification = buildEmailNotification(
                    application.getCandidateId(),
                    "Résultat de votre candidature",
                    "application_rejected",
                    Map.of(
                            "candidateName", application.getCandidateName(),
                            "jobTitle", application.getJobTitle(),
                            "reference", application.getReference()
                    )
            );

            // Loguer la notification (à remplacer par un appel au service de notification)
            log.debug("Notification details: {}", objectMapper.writeValueAsString(notification));

        } catch (Exception e) {
            log.error("Error sending application rejected notification: {}", e.getMessage());
        }
    }

    /**
     * Envoie une notification de retrait de candidature.
     *
     * @param application La candidature retirée
     */
    public void sendApplicationWithdrawnNotification(Application application) {
        log.info("NOTIFICATION: Application withdrawn - Reference: {}, Candidate: {}, Job: {}",
                application.getReference(),
                application.getCandidateName(),
                application.getJobTitle());

        try {
            // Construire la notification
            NotificationRequestDTO notification = buildEmailNotification(
                    application.getCandidateId(),
                    "Confirmation de retrait de candidature",
                    "application_withdrawn",
                    Map.of(
                            "candidateName", application.getCandidateName(),
                            "jobTitle", application.getJobTitle(),
                            "reference", application.getReference()
                    )
            );

            // Loguer la notification (à remplacer par un appel au service de notification)
            log.debug("Notification details: {}", objectMapper.writeValueAsString(notification));

        } catch (Exception e) {
            log.error("Error sending application withdrawn notification: {}", e.getMessage());
        }
    }

    /**
     * Envoie une notification de demande d'entretien.
     *
     * @param application La candidature pour laquelle un entretien est demandé
     */
    public void sendInterviewRequestedNotification(Application application) {
        log.info("NOTIFICATION: Interview requested - Reference: {}, Candidate: {}, Job: {}",
                application.getReference(),
                application.getCandidateName(),
                application.getJobTitle());

        try {
            // Construire la notification
            NotificationRequestDTO notification = buildEmailNotification(
                    application.getCandidateId(),
                    "Demande d'entretien pour votre candidature",
                    "interview_requested",
                    Map.of(
                            "candidateName", application.getCandidateName(),
                            "jobTitle", application.getJobTitle(),
                            "reference", application.getReference()
                    )
            );

            // Loguer la notification (à remplacer par un appel au service de notification)
            log.debug("Notification details: {}", objectMapper.writeValueAsString(notification));

        } catch (Exception e) {
            log.error("Error sending interview requested notification: {}", e.getMessage());
        }
    }

    /**
     * Envoie une notification de planification d'entretien.
     *
     * @param application La candidature pour laquelle un entretien est planifié
     */
    public void sendInterviewScheduledNotification(Application application) {
        log.info("NOTIFICATION: Interview scheduled - Reference: {}, Candidate: {}, Job: {}",
                application.getReference(),
                application.getCandidateName(),
                application.getJobTitle());

        try {
            // Construire la notification
            NotificationRequestDTO notification = buildEmailNotification(
                    application.getCandidateId(),
                    "Confirmation de votre entretien",
                    "interview_scheduled",
                    Map.of(
                            "candidateName", application.getCandidateName(),
                            "jobTitle", application.getJobTitle(),
                            "reference", application.getReference()
                    )
            );

            // Loguer la notification (à remplacer par un appel au service de notification)
            log.debug("Notification details: {}", objectMapper.writeValueAsString(notification));

        } catch (Exception e) {
            log.error("Error sending interview scheduled notification: {}", e.getMessage());
        }
    }

    /**
     * Envoie une notification de fin d'entretien.
     *
     * @param application La candidature pour laquelle un entretien est terminé
     */
    public void sendInterviewCompletedNotification(Application application) {
        log.info("NOTIFICATION: Interview completed - Reference: {}, Candidate: {}, Job: {}",
                application.getReference(),
                application.getCandidateName(),
                application.getJobTitle());

        try {
            // Construire la notification
            NotificationRequestDTO notification = buildEmailNotification(
                    application.getCandidateId(),
                    "Suite à votre entretien",
                    "interview_completed",
                    Map.of(
                            "candidateName", application.getCandidateName(),
                            "jobTitle", application.getJobTitle(),
                            "reference", application.getReference()
                    )
            );

            // Loguer la notification (à remplacer par un appel au service de notification)
            log.debug("Notification details: {}", objectMapper.writeValueAsString(notification));

        } catch (Exception e) {
            log.error("Error sending interview completed notification: {}", e.getMessage());
        }
    }

    /**
     * Envoie une notification d'annulation d'entretien.
     *
     * @param application La candidature pour laquelle un entretien est annulé
     */
    public void sendInterviewCanceledNotification(Application application) {
        log.info("NOTIFICATION: Interview canceled - Reference: {}, Candidate: {}, Job: {}",
                application.getReference(),
                application.getCandidateName(),
                application.getJobTitle());

        try {
            // Construire la notification
            NotificationRequestDTO notification = buildEmailNotification(
                    application.getCandidateId(),
                    "Annulation de votre entretien",
                    "interview_canceled",
                    Map.of(
                            "candidateName", application.getCandidateName(),
                            "jobTitle", application.getJobTitle(),
                            "reference", application.getReference()
                    )
            );

            // Loguer la notification (à remplacer par un appel au service de notification)
            log.debug("Notification details: {}", objectMapper.writeValueAsString(notification));

        } catch (Exception e) {
            log.error("Error sending interview canceled notification: {}", e.getMessage());
        }
    }

    /**
     * Construit une notification email.
     *
     * @param recipient Le destinataire
     * @param subject Le sujet
     * @param templateKey La clé du modèle
     * @param parameters Les paramètres du modèle
     * @return La demande de notification
     */
    private NotificationRequestDTO buildEmailNotification(
            String recipient, String subject, String templateKey, Map<String, Object> parameters) {

        NotificationRequestDTO notification = new NotificationRequestDTO();
        notification.setType("EMAIL");
        notification.setTemplateKey(templateKey);
        notification.setRecipient(recipient);
        notification.setSubject(subject);
        notification.setParameters(new HashMap<>(parameters));
        notification.setPriority(3); // Priorité moyenne
        notification.setSourceService("application-service");

        return notification;
    }
}