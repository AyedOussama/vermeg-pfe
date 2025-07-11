package com.pfe2025.application_service.service;

import com.pfe2025.application_service.dto.AISettingsDTO;
import com.pfe2025.application_service.exception.InvalidOperationException;
import com.pfe2025.application_service.exception.ResourceNotFoundException;
import com.pfe2025.application_service.mapper.AISettingsMapper;
import com.pfe2025.application_service.model.AISettings;
import com.pfe2025.application_service.model.Application;
import com.pfe2025.application_service.model.Evaluation;
import com.pfe2025.application_service.repository.AISettingsRepository;
import com.pfe2025.application_service.repository.ApplicationRepository;
import com.pfe2025.application_service.repository.EvaluationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des paramètres d'automatisation IA.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AISettingsService {

    private final AISettingsRepository aiSettingsRepository;
    private final ApplicationRepository applicationRepository;

    private final AISettingsMapper aiSettingsMapper;

    /**
     * Récupère tous les paramètres IA.
     *
     * @return La liste des paramètres IA
     */
    public List<AISettingsDTO> getAllSettings() {
        log.debug("Retrieving all AI settings");
        List<AISettings> settings = aiSettingsRepository.findAll();
        return aiSettingsMapper.toDtoList(settings);
    }

    /**
     * Récupère des paramètres IA par ID.
     *
     * @param id L'ID des paramètres
     * @return Les paramètres IA
     */
    public AISettingsDTO getSettingsById(Long id) {
        log.debug("Retrieving AI settings with ID: {}", id);
        AISettings settings = aiSettingsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AI settings not found with ID: " + id));
        return aiSettingsMapper.toDto(settings);
    }

    /**
     * Récupère des paramètres IA par département.
     *
     * @param department Le département
     * @return Les paramètres IA
     */
    public AISettingsDTO getSettingsByDepartment(String department) {
        log.debug("Retrieving AI settings for department: {}", department);
        AISettings settings = aiSettingsRepository.findByDepartment(department)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AI settings not found for department: " + department));
        return aiSettingsMapper.toDto(settings);
    }

    /**
     * Crée de nouveaux paramètres IA.
     *
     * @param settingsDTO Les paramètres à créer
     * @return Les paramètres créés
     */
    @Transactional
    public AISettingsDTO createSettings(AISettingsDTO settingsDTO) {
        log.debug("Creating AI settings for department: {}", settingsDTO.getDepartment());

        // Vérifier si des paramètres existent déjà pour ce département
        Optional<AISettings> existingSettings = aiSettingsRepository.findByDepartment(settingsDTO.getDepartment());
        if (existingSettings.isPresent()) {
            throw new InvalidOperationException(
                    "AI settings already exist for department: " + settingsDTO.getDepartment());
        }

        // Valider les seuils
        validateThresholds(settingsDTO);

        // Créer l'entité
        AISettings settings = aiSettingsMapper.toEntity(settingsDTO);
        settings.setCreatedAt(LocalDateTime.now());
        settings.setLastCalibrationDate(LocalDateTime.now());

        // Sauvegarder
        settings = aiSettingsRepository.save(settings);

        return aiSettingsMapper.toDto(settings);
    }

    /**
     * Met à jour des paramètres IA existants.
     *
     * @param id L'ID des paramètres
     * @param settingsDTO Les nouvelles valeurs
     * @return Les paramètres mis à jour
     */
    @Transactional
    public AISettingsDTO updateSettings(Long id, AISettingsDTO settingsDTO) {
        log.debug("Updating AI settings with ID: {}", id);

        // Récupérer les paramètres
        AISettings settings = aiSettingsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AI settings not found with ID: " + id));

        // Valider les seuils
        validateThresholds(settingsDTO);

        // Mettre à jour
        aiSettingsMapper.updateFromDto(settingsDTO, settings);
        settings.setUpdatedAt(LocalDateTime.now());

        // Sauvegarder
        settings = aiSettingsRepository.save(settings);

        return aiSettingsMapper.toDto(settings);
    }

    /**
     * Active ou désactive des paramètres IA.
     *
     * @param id L'ID des paramètres
     * @param active L'état d'activation
     * @return Les paramètres mis à jour
     */
    @Transactional
    public AISettingsDTO setSettingsActive(Long id, boolean active) {
        log.debug("Setting AI settings with ID: {} to active={}", id, active);

        // Récupérer les paramètres
        AISettings settings = aiSettingsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AI settings not found with ID: " + id));

        // Mettre à jour
        settings.setIsActive(active);
        settings.setUpdatedAt(LocalDateTime.now());

        // Sauvegarder
        settings = aiSettingsRepository.save(settings);

        return aiSettingsMapper.toDto(settings);
    }

    /**
     * Calibre automatiquement des paramètres IA en fonction des données historiques.
     *
     * @param id L'ID des paramètres
     * @return Les paramètres calibrés
     */
    @Transactional
    public AISettingsDTO calibrateSettings(Long id) {
        log.debug("Calibrating AI settings with ID: {}", id);

        // Récupérer les paramètres
        AISettings settings = aiSettingsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AI settings not found with ID: " + id));

        // Récupérer les candidatures pour ce département
        AISettings finalSettings = settings;
        List<Application> applications = applicationRepository.findAll().stream()
                .filter(app -> app.getJobDepartment() != null &&
                        app.getJobDepartment().equals(finalSettings.getDepartment()))
                .filter(app -> app.getAiProcessed() != null && app.getAiProcessed())
                .collect(Collectors.toList());

        if (applications.isEmpty()) {
            log.info("No applications found for calibration for department: {}", settings.getDepartment());
            throw new InvalidOperationException(
                    "Impossible de calibrer: aucune candidature évaluée trouvée pour le département " +
                            settings.getDepartment());
        }

        // Analyser les évaluations
        int totalEvaluations = applications.size();

        // Calculer le score moyen des candidatures acceptées (SHORTLISTED ou mieux)
        double avgAcceptedScore = applications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.SHORTLISTED ||
                        app.getStatus() == Application.ApplicationStatus.INTERVIEW_REQUESTED ||
                        app.getStatus() == Application.ApplicationStatus.INTERVIEW_SCHEDULED ||
                        app.getStatus() == Application.ApplicationStatus.INTERVIEW_COMPLETED ||
                        app.getStatus() == Application.ApplicationStatus.OFFER_EXTENDED ||
                        app.getStatus() == Application.ApplicationStatus.HIRED)
                .mapToDouble(app -> app.getAiScore() != null ? app.getAiScore() : 0.0)
                .average()
                .orElse(75.0);

        // Calculer le score moyen des candidatures rejetées
        double avgRejectedScore = applications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.REJECTED)
                .mapToDouble(app -> app.getAiScore() != null ? app.getAiScore() : 0.0)
                .average()
                .orElse(40.0);

        // Calculer les seuils optimaux
        // On utilise une approche simple: 5% en dessous du score moyen d'acceptation pour autoAcceptThreshold
        // et 5% au-dessus du score moyen de rejet pour autoRejectThreshold
        double newAutoAcceptThreshold = Math.max(75.0, avgAcceptedScore - 5.0);
        double newAutoRejectThreshold = Math.min(45.0, avgRejectedScore + 5.0);

        // Garantir que les seuils sont valides (pas de chevauchement)
        if (newAutoRejectThreshold >= newAutoAcceptThreshold) {
            newAutoRejectThreshold = Math.max(40.0, newAutoAcceptThreshold - 10.0);
        }

        // Mettre à jour les seuils
        settings.setAutoAcceptThreshold(newAutoAcceptThreshold);
        settings.setAutoRejectThreshold(newAutoRejectThreshold);
        settings.setReviewThreshold((newAutoAcceptThreshold + newAutoRejectThreshold) / 2.0);

        // Mettre à jour la date de calibration
        settings.setLastCalibrationDate(LocalDateTime.now());
        settings.setUpdatedAt(LocalDateTime.now());

        // Sauvegarder
        settings = aiSettingsRepository.save(settings);

        log.info("Calibrated AI settings for department {}: autoAcceptThreshold={}, autoRejectThreshold={}",
                settings.getDepartment(), settings.getAutoAcceptThreshold(), settings.getAutoRejectThreshold());

        return aiSettingsMapper.toDto(settings);
    }

    /**
     * Calibre tous les paramètres IA configurés pour le calibrage automatique.
     * Destiné à être appelé par un planificateur.
     */
    @Transactional
    public void calibrateAllAutoSettings() {
        log.info("Calibrating all self-calibrating AI settings");

        List<AISettings> settingsToCalibrate = aiSettingsRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsSelfCalibrating()) && Boolean.TRUE.equals(s.getIsActive()))
                .collect(Collectors.toList());

        for (AISettings settings : settingsToCalibrate) {
            try {
                log.debug("Auto-calibrating AI settings for department: {}", settings.getDepartment());
                calibrateSettings(settings.getId());
            } catch (Exception e) {
                log.error("Error calibrating AI settings for department {}: {}",
                        settings.getDepartment(), e.getMessage());
            }
        }
    }

    /**
     * Valide les seuils des paramètres IA.
     *
     * @param settingsDTO Les paramètres à valider
     * @throws InvalidOperationException Si les seuils sont invalides
     */
    private void validateThresholds(AISettingsDTO settingsDTO) {
        // Vérifier que les seuils sont dans les bonnes plages
        if (settingsDTO.getAutoAcceptThreshold() != null &&
                (settingsDTO.getAutoAcceptThreshold() < 0 || settingsDTO.getAutoAcceptThreshold() > 100)) {
            throw new InvalidOperationException(
                    "Auto accept threshold must be between 0 and 100");
        }

        if (settingsDTO.getAutoRejectThreshold() != null &&
                (settingsDTO.getAutoRejectThreshold() < 0 || settingsDTO.getAutoRejectThreshold() > 100)) {
            throw new InvalidOperationException(
                    "Auto reject threshold must be between 0 and 100");
        }

        if (settingsDTO.getReviewThreshold() != null &&
                (settingsDTO.getReviewThreshold() < 0 || settingsDTO.getReviewThreshold() > 100)) {
            throw new InvalidOperationException(
                    "Review threshold must be between 0 and 100");
        }

        // Vérifier que autoAcceptThreshold > autoRejectThreshold
        if (settingsDTO.getAutoAcceptThreshold() != null &&
                settingsDTO.getAutoRejectThreshold() != null &&
                settingsDTO.getAutoAcceptThreshold() <= settingsDTO.getAutoRejectThreshold()) {
            throw new InvalidOperationException(
                    "Auto accept threshold must be greater than auto reject threshold");
        }
    }

    /**
     * Récupère les statistiques IA pour un département.
     *
     * @param department Le département
     * @return Une carte des statistiques
     */
    public Map<String, Object> getAIDepartmentStats(String department) {
        log.debug("Getting AI stats for department: {}", department);

        Map<String, Object> stats = new HashMap<>();

        // Vérifier si des paramètres existent pour ce département
        Optional<AISettings> aiSettings = aiSettingsRepository.findByDepartment(department);
        if (aiSettings.isEmpty()) {
            stats.put("department", department);
            stats.put("settingsExist", false);
            return stats;
        }

        AISettings settings = aiSettings.get();
        stats.put("department", department);
        stats.put("settingsExist", true);
        stats.put("isActive", settings.getIsActive());
        stats.put("automationLevel", settings.getAutomationLevel());
        stats.put("autoAcceptThreshold", settings.getAutoAcceptThreshold());
        stats.put("autoRejectThreshold", settings.getAutoRejectThreshold());
        stats.put("lastCalibrationDate", settings.getLastCalibrationDate());

        // Calculer les statistiques d'automatisation
        List<Application> applications = applicationRepository.findAll().stream()
                .filter(app -> app.getJobDepartment() != null &&
                        app.getJobDepartment().equals(department))
                .filter(app -> app.getAiProcessed() != null && app.getAiProcessed())
                .collect(Collectors.toList());

        if (!applications.isEmpty()) {
            int totalEvaluations = applications.size();

            long autoDecisionCount = applications.stream()
                    .filter(app -> Boolean.TRUE.equals(app.getAutoDecision()))
                    .count();

            double autoDecisionRate = (double) autoDecisionCount / totalEvaluations * 100;

            stats.put("totalEvaluations", totalEvaluations);
            stats.put("autoDecisionCount", autoDecisionCount);
            stats.put("autoDecisionRate", autoDecisionRate);

            // Répartition des décisions automatiques
            long autoAcceptCount = applications.stream()
                    .filter(app -> Boolean.TRUE.equals(app.getAutoDecision()) &&
                            app.getStatus() == Application.ApplicationStatus.SHORTLISTED)
                    .count();

            long autoRejectCount = applications.stream()
                    .filter(app -> Boolean.TRUE.equals(app.getAutoDecision()) &&
                            app.getStatus() == Application.ApplicationStatus.REJECTED)
                    .count();

            stats.put("autoAcceptCount", autoAcceptCount);
            stats.put("autoRejectCount", autoRejectCount);

            // Score moyen
            double avgScore = applications.stream()
                    .mapToDouble(app -> app.getAiScore() != null ? app.getAiScore() : 0.0)
                    .average()
                    .orElse(0.0);

            stats.put("averageScore", avgScore);
        } else {
            stats.put("totalEvaluations", 0);
            stats.put("autoDecisionCount", 0);
            stats.put("autoDecisionRate", 0.0);
            stats.put("autoAcceptCount", 0);
            stats.put("autoRejectCount", 0);
            stats.put("averageScore", 0.0);
        }

        return stats;
    }
}