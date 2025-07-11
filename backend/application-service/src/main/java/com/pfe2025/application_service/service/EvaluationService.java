package com.pfe2025.application_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe2025.application_service.config.ApplicationProperties;
import com.pfe2025.application_service.dto.CandidateProfileDTO;
import com.pfe2025.application_service.dto.EvaluationDTO;
import com.pfe2025.application_service.dto.JobPostingDTO;
import com.pfe2025.application_service.event.ApplicationEvaluatedEvent;
import com.pfe2025.application_service.event.ApplicationEvaluationRequestedEvent;
import com.pfe2025.application_service.exception.AIEvaluationException;
import com.pfe2025.application_service.exception.ResourceNotFoundException;
import com.pfe2025.application_service.integration.AIServiceClient;
import com.pfe2025.application_service.integration.CandidateServiceClient;
import com.pfe2025.application_service.integration.JobPostingServiceClient;
import com.pfe2025.application_service.mapper.EvaluationMapper;
import com.pfe2025.application_service.model.AISettings;
import com.pfe2025.application_service.model.Application;
import com.pfe2025.application_service.model.Application.ApplicationStatus;
import com.pfe2025.application_service.model.Evaluation;
import com.pfe2025.application_service.model.Evaluation.EvaluationRecommendation;
import com.pfe2025.application_service.repository.AISettingsRepository;
import com.pfe2025.application_service.repository.ApplicationRepository;
import com.pfe2025.application_service.repository.EvaluationRepository;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service pour la gestion des évaluations IA des candidatures.
 * Fournit des fonctionnalités pour demander des évaluations, traiter les résultats et prendre des décisions automatiques.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@CacheConfig(cacheNames = "evaluations")
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final ApplicationRepository applicationRepository;
    private final AISettingsRepository aiSettingsRepository;
    private final AIServiceClient aiServiceClient;
    private final CandidateServiceClient candidateServiceClient;
    private final JobPostingServiceClient jobPostingServiceClient;
    private final EvaluationMapper evaluationMapper;
    private final ObjectMapper objectMapper;
    private final StreamBridge streamBridge;
    private final NotificationService notificationService;
    private final ApplicationProperties applicationProperties;

    /**
     * Demande une évaluation pour une candidature auprès du service IA.
     * Récupère les données du profil candidat et de l'offre d'emploi à inclure dans l'évaluation.
     *
     * @param event L'événement de demande d'évaluation
     */
    @Async
    @Retry(name = "aiServiceClient")
    public void requestEvaluation(ApplicationEvaluationRequestedEvent event) {
        log.debug("Requesting evaluation for application {}", event.getApplicationId());

        try {
            // Récupérer les données du candidat et de l'offre d'emploi en parallèle
            candidateServiceClient.getCandidateProfile(event.getCandidateId())
                    .zipWith(jobPostingServiceClient.getJobPosting(event.getJobPostingId()))
                    .flatMap(tuple -> {
                        CandidateProfileDTO candidateProfile = tuple.getT1();
                        JobPostingDTO jobPosting = tuple.getT2();

                        if (candidateProfile == null) {
                            return Mono.error(new ResourceNotFoundException("Profil du candidat non trouvé"));
                        }

                        if (jobPosting == null) {
                            return Mono.error(new ResourceNotFoundException("Offre d'emploi non trouvée"));
                        }

                        log.info("Traitement de l'évaluation avec le profil candidat complet et les données de l'offre d'emploi pour la candidature {}",
                                event.getApplicationId());

                        // Envoyer les données complètes au service IA
                        return aiServiceClient.evaluateApplication(
                                event.getApplicationId(),
                                candidateProfile,
                                jobPosting
                        );
                    })
                    .subscribe(
                            evaluationResult -> {
                                // Créer un événement d'évaluation
                                ApplicationEvaluatedEvent evaluatedEvent = ApplicationEvaluatedEvent.builder()
                                        .applicationId(event.getApplicationId())
                                        .reference(event.getReference())
                                        .overallScore(evaluationResult.getOverallScore())
                                        .justification(evaluationResult.getJustification())
                                        .categoryScores(evaluationResult.getCategoryScores())
                                        .strengths(evaluationResult.getStrengths())
                                        .weaknesses(evaluationResult.getWeaknesses())
                                        .recommendation(evaluationResult.getRecommendation())
                                        .modelUsed(evaluationResult.getModelUsed())
                                        .evaluatedAt(LocalDateTime.now())
                                        .build();

                                // Publier l'événement via StreamBridge
                                streamBridge.send("applicationEvaluatedSupplier-out-0", evaluatedEvent);

                                // Traiter le résultat de façon synchrone
                                processEvaluationResult(evaluatedEvent);

                                log.info("Évaluation terminée pour la candidature {}: Score={}, Recommandation={}",
                                        event.getApplicationId(),
                                        evaluationResult.getOverallScore(),
                                        evaluationResult.getRecommendation());
                            },
                            error -> {
                                log.error("Erreur pendant le processus d'évaluation pour la candidature {}: {}",
                                        event.getApplicationId(), error.getMessage(), error);

                                // Essayer de mettre à jour le statut de la candidature pour refléter l'erreur
                                try {
                                    Optional<Application> appOpt = applicationRepository.findById(event.getApplicationId());
                                    if (appOpt.isPresent()) {
                                        Application app = appOpt.get();
                                        if (app.getStatus() == ApplicationStatus.UNDER_REVIEW) {
                                            app.setStatus(ApplicationStatus.SUBMITTED);
                                            app.setLastStatusChangedAt(LocalDateTime.now());
                                            app.setLastStatusChangedBy("SYSTEM");
                                            app.addStatusHistoryEntry(
                                                    ApplicationStatus.UNDER_REVIEW,
                                                    ApplicationStatus.SUBMITTED,
                                                    "SYSTEM",
                                                    "Échec de l'évaluation IA: " + error.getMessage());
                                            applicationRepository.save(app);
                                        }
                                    }
                                } catch (Exception e) {
                                    log.error("Erreur lors de la mise à jour de la candidature après échec d'évaluation: {}", e.getMessage());
                                }
                            }
                    );

        } catch (Exception e) {
            log.error("Erreur lors de la demande d'évaluation: {}", e.getMessage(), e);
            throw new AIEvaluationException("Erreur lors de la demande d'évaluation: " + e.getMessage(), e);
        }
    }

    /**
     * Traite le résultat d'une évaluation IA et met à jour la candidature en conséquence.
     * Peut prendre des décisions automatiques basées sur les paramètres IA.
     *
     * @param event L'événement d'évaluation
     */
    @Transactional
    @CacheEvict(allEntries = true)
    public void processEvaluationResult(ApplicationEvaluatedEvent event) {
        log.debug("Traitement du résultat d'évaluation pour la candidature {}", event.getApplicationId());

        try {
            // Récupérer la candidature
            Application application = applicationRepository.findById(event.getApplicationId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Candidature non trouvée avec l'ID: " + event.getApplicationId()));

            // Vérifier s'il existe déjà une évaluation
            Optional<Evaluation> existingEvaluation = evaluationRepository.findByApplicationId(
                    event.getApplicationId());

            Evaluation evaluation;
            if (existingEvaluation.isPresent()) {
                // Mettre à jour l'évaluation existante
                evaluation = existingEvaluation.get();
                evaluation.setOverallScore(event.getOverallScore());
                evaluation.setJustification(event.getJustification());
                evaluation.setCategoryScores(evaluationMapper.mapToJson(event.getCategoryScores()));
                evaluation.setStrengths(event.getStrengths());
                evaluation.setWeaknesses(event.getWeaknesses());
                evaluation.setRecommendation(EvaluationRecommendation.fromString(event.getRecommendation().name()));
                evaluation.setModelUsed(event.getModelUsed());
                evaluation.setUpdatedAt(LocalDateTime.now());
            } else {
                // Créer une nouvelle évaluation
                evaluation = evaluationMapper.fromApplicationEvaluatedEvent(event);
                evaluation.setApplication(application);
                evaluation.setCreatedAt(LocalDateTime.now());
            }

            // Récupérer les paramètres IA pour le département
            Optional<AISettings> aiSettings = aiSettingsRepository.findByDepartmentAndIsActive(
                    application.getJobDepartment(), true);

            // Déterminer si une décision automatique doit être prise
            boolean autoDecision = false;
            ApplicationStatus newStatus = null;

            if (aiSettings.isPresent()) {
                AISettings settings = aiSettings.get();

                Double autoAcceptThreshold = settings.getAutoAcceptThreshold();
                Double autoRejectThreshold = settings.getAutoRejectThreshold();

                if (settings.isAutoAcceptEnabled() &&
                        evaluation.isAutoAcceptable(autoAcceptThreshold != null ?
                                autoAcceptThreshold : applicationProperties.getAi().getEvaluation().getAutoThresholdAccept())) {
                    // Acceptation automatique
                    autoDecision = true;
                    newStatus = ApplicationStatus.SHORTLISTED;
                    evaluation.setExceededAutoThreshold(true);
                } else if (settings.isAutoRejectEnabled() &&
                        evaluation.isAutoRejectable(autoRejectThreshold != null ?
                                autoRejectThreshold : applicationProperties.getAi().getEvaluation().getAutoThresholdReject())) {
                    // Rejet automatique
                    autoDecision = true;
                    newStatus = ApplicationStatus.REJECTED;
                    evaluation.setExceededAutoThreshold(true);
                } else {
                    // Pas de décision automatique, mettre à UNDER_REVIEW
                    newStatus = ApplicationStatus.UNDER_REVIEW;
                    evaluation.setExceededAutoThreshold(false);
                }
            } else {
                // Utiliser les seuils par défaut
                if (evaluation.isAutoAcceptable(applicationProperties.getAi().getEvaluation().getAutoThresholdAccept())) {
                    autoDecision = true;
                    newStatus = ApplicationStatus.SHORTLISTED;
                    evaluation.setExceededAutoThreshold(true);
                } else if (evaluation.isAutoRejectable(applicationProperties.getAi().getEvaluation().getAutoThresholdReject())) {
                    autoDecision = true;
                    newStatus = ApplicationStatus.REJECTED;
                    evaluation.setExceededAutoThreshold(true);
                } else {
                    newStatus = ApplicationStatus.UNDER_REVIEW;
                    evaluation.setExceededAutoThreshold(false);
                }
            }

            // Sauvegarder l'évaluation
            evaluation = evaluationRepository.save(evaluation);

            // Mettre à jour la candidature
            ApplicationStatus previousStatus = application.getStatus();
            application.setAiProcessed(true);
            application.setAiScore(event.getOverallScore());
            application.setAutoDecision(autoDecision);

            if (newStatus != null) {
                application.setStatus(newStatus);
                application.setLastStatusChangedAt(LocalDateTime.now());
                application.setLastStatusChangedBy("AI");

                // Mettre à jour la date de traitement pour les candidatures acceptées ou rejetées
                if (newStatus == ApplicationStatus.SHORTLISTED || newStatus == ApplicationStatus.REJECTED) {
                    if (application.getProcessedAt() == null) {
                        application.setProcessedAt(LocalDateTime.now());
                    }
                }

                // Ajouter une entrée à l'historique
                application.addStatusHistoryEntry(
                        previousStatus,
                        newStatus,
                        "AI",
                        "Décision " + (autoDecision ? "automatique" : "assistée") + " IA " +
                                " - Score: " + event.getOverallScore() + "/100");
            }

            // Mettre à jour des champs spécifiques
            if (newStatus == ApplicationStatus.SHORTLISTED) {
                application.setIsShortlisted(true);
            } else if (newStatus == ApplicationStatus.REJECTED) {
                application.setIsShortlisted(false);
            }

            // Sauvegarder la candidature
            application = applicationRepository.save(application);

            // Envoyer des notifications pour les décisions automatiques
            if (autoDecision) {
                if (newStatus == ApplicationStatus.SHORTLISTED) {
                    notificationService.sendApplicationShortlistedNotification(application);
                } else if (newStatus == ApplicationStatus.REJECTED) {
                    notificationService.sendApplicationRejectedNotification(application);
                }
            }

            log.info("Évaluation traitée pour la candidature {}: Score={}, Recommandation={}, Décision automatique={}",
                    application.getId(), event.getOverallScore(), event.getRecommendation(), autoDecision);

        } catch (Exception e) {
            log.error("Erreur lors du traitement du résultat d'évaluation: {}", e.getMessage(), e);
            throw new AIEvaluationException("Erreur lors du traitement du résultat d'évaluation: " + e.getMessage(), e);
        }
    }

    /**
     * Déclenche une évaluation IA pour une candidature.
     * @param application La candidature
     */
    @Async
    public void triggerAIEvaluation(Application application) {
        log.debug("Déclenchement de l'évaluation IA pour la candidature {}", application.getId());

        try {
            // Vérifier si nous avons déjà une évaluation IA
            if (Boolean.TRUE.equals(application.getAiProcessed())) {
                log.info("La candidature {} est déjà traitée par l'IA, évaluation ignorée", application.getId());
                return;
            }

            // S'assurer que nous avons un CV
            if (application.getResumeDocumentId() == null) {
                log.warn("Impossible d'évaluer la candidature {} sans CV", application.getId());
                return;
            }

            // Mettre à jour le statut de la candidature en examen
            if (application.getStatus() == ApplicationStatus.SUBMITTED) {
                application.setStatus(ApplicationStatus.UNDER_REVIEW);
                application.setLastStatusChangedAt(LocalDateTime.now());
                application.setLastStatusChangedBy("SYSTEM");
                application.addStatusHistoryEntry(
                        ApplicationStatus.SUBMITTED,
                        ApplicationStatus.UNDER_REVIEW,
                        "SYSTEM",
                        "Candidature en cours d'examen par l'IA");
                applicationRepository.save(application);
            }

            // Créer un événement de demande d'évaluation
            ApplicationEvaluationRequestedEvent requestEvent = ApplicationEvaluationRequestedEvent.builder()
                    .applicationId(application.getId())
                    .reference(application.getReference())
                    .candidateId(application.getCandidateId())
                    .jobPostingId(application.getJobPostingId())
                    .resumeDocumentId(application.getResumeDocumentId())
                    .coverLetterDocumentId(application.getCoverLetterDocumentId())
                    .candidateName(application.getCandidateName())
                    .jobTitle(application.getJobTitle())
                    .jobDescription(null) // À compléter si nécessaire
                    .additionalContext(null) // À compléter si nécessaire
                    .requestedAt(LocalDateTime.now())
                    .build();

            // Demander l'évaluation (evaluationService traitera la réponse via l'événement)
            requestEvaluation(requestEvent);

        } catch (Exception e) {
            log.error("Erreur lors du déclenchement de l'évaluation IA pour la candidature {}: {}",
                    application.getId(), e.getMessage(), e);
        }
    }

    /**
     * Récupère l'évaluation pour une candidature.
     *
     * @param applicationId L'ID de la candidature
     * @return Le DTO d'évaluation
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "#applicationId")
    public EvaluationDTO getEvaluationByApplicationId(Long applicationId) {
        log.debug("Récupération de l'évaluation pour la candidature {}", applicationId);

        Evaluation evaluation = evaluationRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluation non trouvée pour la candidature: " + applicationId));

        return evaluationMapper.toEvaluationDTO(evaluation);
    }

    /**
     * Récupère le score moyen d'évaluation pour une offre d'emploi.
     *
     * @param jobPostingId L'ID de l'offre d'emploi
     * @return Le score moyen
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'job-avg-' + #jobPostingId")
    public Double getAverageScoreForJobPosting(Long jobPostingId) {
        log.debug("Récupération du score moyen pour l'offre d'emploi {}", jobPostingId);

        return evaluationRepository.getAverageScoreByJobPosting(jobPostingId);
    }

    /**
     * Récupère le score moyen d'évaluation pour un département.
     *
     * @param department Le département
     * @return Le score moyen
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'dept-avg-' + #department")
    public Double getAverageScoreForDepartment(String department) {
        log.debug("Récupération du score moyen pour le département {}", department);

        return evaluationRepository.getAverageScoreByDepartment(department);
    }

    /**
     * Récupère les statistiques de recommandation pour un département.
     *
     * @param department Le département
     * @return Une carte des statistiques de recommandation
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'dept-recommendations-' + #department")
    public Map<EvaluationRecommendation, Long> getRecommendationStatsForDepartment(String department) {
        log.debug("Récupération des statistiques de recommandation pour le département {}", department);

        List<Object[]> results = evaluationRepository.countByRecommendationForDepartment(department);
        Map<EvaluationRecommendation, Long> stats = new HashMap<>();

        for (Object[] result : results) {
            EvaluationRecommendation recommendation = (EvaluationRecommendation) result[0];
            Long count = (Long) result[1];
            stats.put(recommendation, count);
        }

        return stats;
    }
}