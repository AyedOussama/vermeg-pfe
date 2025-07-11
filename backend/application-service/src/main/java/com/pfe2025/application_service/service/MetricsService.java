package com.pfe2025.application_service.service;

import com.pfe2025.application_service.model.Application;
import com.pfe2025.application_service.model.Metrics;
import com.pfe2025.application_service.repository.ApplicationRepository;
import com.pfe2025.application_service.repository.EvaluationRepository;
import com.pfe2025.application_service.repository.MetricsRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des métriques.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

    private final MetricsRepository metricsRepository;
    private final ApplicationRepository applicationRepository;
    private final EvaluationRepository evaluationRepository;

    /**
     * Génère les métriques quotidiennes.
     * Destiné à être appelé par un planificateur.
     */
    @Scheduled(cron = "${app.scheduler.metrics-generation-cron:0 0 1 * * ?}")
    @Transactional
    public void generateDailyMetrics() {
        log.info("Generating daily metrics");

        // Générer les métriques pour la veille
        LocalDate yesterday = LocalDate.now().minusDays(1);

        // Récupérer toutes les candidatures soumises hier
        LocalDateTime startOfDay = yesterday.atStartOfDay();
        LocalDateTime endOfDay = yesterday.plusDays(1).atStartOfDay().minusSeconds(1);

        List<Application> applications = applicationRepository.findBySubmittedAtBetween(startOfDay, endOfDay);

        if (applications.isEmpty()) {
            log.info("No applications found for {}, skipping metrics generation", yesterday);
            return;
        }

        // Regrouper par département
        Map<String, List<Application>> applicationsByDepartment = applications.stream()
                .filter(app -> app.getJobDepartment() != null)
                .collect(Collectors.groupingBy(Application::getJobDepartment));

        // Générer une métrique pour chaque département
        applicationsByDepartment.forEach((department, departmentApps) -> {
            generateMetricsForDepartment(department, departmentApps, yesterday);
        });

        // Générer une métrique globale (tous départements confondus)
        generateMetricsForDepartment("ALL", applications, yesterday);

        log.info("Successfully generated metrics for {} departments", applicationsByDepartment.size() + 1);
    }

    /**
     * Génère les métriques pour un département spécifique.
     *
     * @param department Le département
     * @param applications Les candidatures du département
     * @param date La date des métriques
     */
    private void generateMetricsForDepartment(String department, List<Application> applications, LocalDate date) {
        log.debug("Generating metrics for department {} for date {}", department, date);

        // Vérifier si des métriques existent déjà pour ce département et cette date
        Optional<Metrics> existingMetrics = metricsRepository.findByMetricsDateAndDepartment(date, department);

        Metrics metrics;
        if (existingMetrics.isPresent()) {
            metrics = existingMetrics.get();
            log.debug("Updating existing metrics for department {} for date {}", department, date);
        } else {
            metrics = Metrics.builder()
                    .metricsDate(date)
                    .department(department)
                    .build();
            log.debug("Creating new metrics for department {} for date {}", department, date);
        }

        // Nombre total de candidatures
        metrics.setTotalApplications(applications.size());

        // Nombre de nouvelles candidatures
        metrics.setNewApplications((int) applications.stream()
                .filter(app -> app.getSubmittedAt() != null &&
                        app.getSubmittedAt().toLocalDate().equals(date))
                .count());

        // Nombre de candidatures traitées
        metrics.setReviewedApplications((int) applications.stream()
                .filter(app -> app.getProcessedAt() != null &&
                        app.getProcessedAt().toLocalDate().equals(date))
                .count());

        // Nombre de candidatures présélectionnées
        metrics.setShortlistedApplications((int) applications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.SHORTLISTED ||
                        app.getStatus() == Application.ApplicationStatus.INTERVIEW_REQUESTED ||
                        app.getStatus() == Application.ApplicationStatus.INTERVIEW_SCHEDULED ||
                        app.getStatus() == Application.ApplicationStatus.INTERVIEW_COMPLETED ||
                        app.getStatus() == Application.ApplicationStatus.OFFER_EXTENDED ||
                        app.getStatus() == Application.ApplicationStatus.HIRED)
                .count());

        // Nombre de candidatures rejetées
        metrics.setRejectedApplications((int) applications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.REJECTED)
                .count());

        // Nombre de décisions automatiques
        List<Long> applicationIds = applications.stream()
                .map(Application::getId)
                .collect(Collectors.toList());

        // Acceptations automatiques
        metrics.setAutoAcceptedApplications(
                applicationRepository.countAutoDecisionsByStatusAndApplicationIds(
                        Application.ApplicationStatus.SHORTLISTED, applicationIds).intValue());

        // Rejets automatiques
        metrics.setAutoRejectedApplications(
                applicationRepository.countAutoDecisionsByStatusAndApplicationIds(
                        Application.ApplicationStatus.REJECTED, applicationIds).intValue());

        // Temps moyen de traitement (en minutes)
        metrics.setAverageProcessingTimeMinutes(
                applicationRepository.calculateAverageProcessingTimeMinutes(applicationIds));

        // Score moyen d'évaluation
        metrics.setAverageEvaluationScore(
                applicationRepository.calculateAverageEvaluationScore(applicationIds));

        // Sauvegarder les métriques
        metricsRepository.save(metrics);

        log.debug("Successfully saved metrics for department {} for date {}", department, date);
    }

    /**
     * Récupère les métriques pour un département et une période donnés.
     *
     * @param department Le département
     * @param startDate La date de début
     * @param endDate La date de fin
     * @return Les métriques pour cette période
     */
    public List<Metrics> getMetricsByDepartmentAndPeriod(String department, LocalDate startDate, LocalDate endDate) {
        log.debug("Retrieving metrics for department {} from {} to {}", department, startDate, endDate);

        return metricsRepository.findByMetricsDateBetweenAndDepartmentOrderByMetricsDate(
                startDate, endDate, department);
    }

    /**
     * Récupère les métriques globales pour une période donnée.
     *
     * @param startDate La date de début
     * @param endDate La date de fin
     * @return Les métriques pour cette période
     */
    public List<Metrics> getMetricsByPeriod(LocalDate startDate, LocalDate endDate) {
        log.debug("Retrieving global metrics from {} to {}", startDate, endDate);

        return metricsRepository.findByMetricsDateBetweenOrderByMetricsDate(startDate, endDate);
    }

    /**
     * Calcule des métriques en temps réel pour un département.
     *
     * @param department Le département
     * @return Une carte des métriques
     */
    public Map<String, Object> getRealTimeMetricsForDepartment(String department) {
        log.debug("Calculating real-time metrics for department {}", department);

        Map<String, Object> metrics = new HashMap<>();

        // Filtrer les applications pour ce département
        List<Application> applications;
        if (department != null && !department.equalsIgnoreCase("ALL")) {
            applications = applicationRepository.findAll().stream()
                    .filter(app -> app.getJobDepartment() != null &&
                            app.getJobDepartment().equalsIgnoreCase(department))
                    .collect(Collectors.toList());
        } else {
            applications = applicationRepository.findAll();
        }

        // Statistiques générales
        metrics.put("totalApplications", applications.size());

        // Nouvelles candidatures aujourd'hui
        LocalDate today = LocalDate.now();
        int newToday = (int) applications.stream()
                .filter(app -> app.getSubmittedAt() != null &&
                        app.getSubmittedAt().toLocalDate().equals(today))
                .count();
        metrics.put("newApplicationsToday", newToday);

        // Candidatures traitées aujourd'hui
        int processedToday = (int) applications.stream()
                .filter(app -> app.getProcessedAt() != null &&
                        app.getProcessedAt().toLocalDate().equals(today))
                .count();
        metrics.put("processedApplicationsToday", processedToday);

        // Compter par statut
        Map<String, Long> statusCounts = applications.stream()
                .collect(Collectors.groupingBy(
                        app -> app.getStatus().name(),
                        Collectors.counting()
                ));
        metrics.put("statusCounts", statusCounts);

        // Calculer le taux de conversion
        long shortlistedCount = applications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.SHORTLISTED ||
                        app.getStatus() == Application.ApplicationStatus.INTERVIEW_REQUESTED ||
                        app.getStatus() == Application.ApplicationStatus.INTERVIEW_SCHEDULED ||
                        app.getStatus() == Application.ApplicationStatus.INTERVIEW_COMPLETED ||
                        app.getStatus() == Application.ApplicationStatus.OFFER_EXTENDED ||
                        app.getStatus() == Application.ApplicationStatus.HIRED)
                .count();

        double conversionRate = applications.isEmpty() ? 0.0 :
                (double) shortlistedCount / applications.size() * 100;
        metrics.put("conversionRate", conversionRate);

        // Score moyen
        Double avgScore = applications.stream()
                .filter(app -> app.getAiScore() != null)
                .mapToDouble(Application::getAiScore)
                .average()
                .orElse(0.0);
        metrics.put("averageScore", avgScore);

        // Automatisation
        long autoDecisionCount = applications.stream()
                .filter(app -> Boolean.TRUE.equals(app.getAutoDecision()))
                .count();
        double autoDecisionRate = applications.isEmpty() ? 0.0 :
                (double) autoDecisionCount / applications.size() * 100;
        metrics.put("autoDecisionCount", autoDecisionCount);
        metrics.put("autoDecisionRate", autoDecisionRate);

        return metrics;
    }

    /**
     * Calcule des métriques de performance pour un département sur une période.
     *
     * @param department Le département
     * @param startDate La date de début
     * @param endDate La date de fin
     * @return Une carte des métriques de performance
     */
    public Map<String, Object> getDepartmentPerformanceMetrics(
            String department, LocalDate startDate, LocalDate endDate) {

        log.debug("Calculating performance metrics for department {} from {} to {}",
                department, startDate, endDate);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("department", department);
        metrics.put("startDate", startDate);
        metrics.put("endDate", endDate);

        // Récupérer les métriques agrégées pour cette période
        List<Metrics> metricsForPeriod = metricsRepository.findByMetricsDateBetweenAndDepartmentOrderByMetricsDate(
                startDate, endDate, department);

        if (metricsForPeriod.isEmpty()) {
            log.info("No metrics found for department {} in period", department);
            return metrics;
        }

        // Calculer les totaux
        int totalApplications = metricsForPeriod.stream()
                .mapToInt(Metrics::getTotalApplications)
                .sum();

        int totalNewApplications = metricsForPeriod.stream()
                .mapToInt(Metrics::getNewApplications)
                .sum();

        int totalReviewedApplications = metricsForPeriod.stream()
                .mapToInt(Metrics::getReviewedApplications)
                .sum();

        int totalShortlistedApplications = metricsForPeriod.stream()
                .mapToInt(Metrics::getShortlistedApplications)
                .sum();

        int totalRejectedApplications = metricsForPeriod.stream()
                .mapToInt(Metrics::getRejectedApplications)
                .sum();

        int totalAutoAcceptedApplications = metricsForPeriod.stream()
                .mapToInt(Metrics::getAutoAcceptedApplications)
                .sum();

        int totalAutoRejectedApplications = metricsForPeriod.stream()
                .mapToInt(Metrics::getAutoRejectedApplications)
                .sum();

        // Calculer les moyennes
        double avgProcessingTime = metricsForPeriod.stream()
                .filter(m -> m.getAverageProcessingTimeMinutes() != null)
                .mapToDouble(Metrics::getAverageProcessingTimeMinutes)
                .average()
                .orElse(0.0);

        double avgScore = metricsForPeriod.stream()
                .filter(m -> m.getAverageEvaluationScore() != null)
                .mapToDouble(Metrics::getAverageEvaluationScore)
                .average()
                .orElse(0.0);

        // Calculer les taux
        double shortlistRate = totalReviewedApplications > 0 ?
                (double) totalShortlistedApplications / totalReviewedApplications * 100 : 0.0;

        double rejectRate = totalReviewedApplications > 0 ?
                (double) totalRejectedApplications / totalReviewedApplications * 100 : 0.0;

        double autoDecisionRate = totalReviewedApplications > 0 ?
                (double) (totalAutoAcceptedApplications + totalAutoRejectedApplications) /
                        totalReviewedApplications * 100 : 0.0;

        // Ajouter les métriques calculées
        metrics.put("totalApplications", totalApplications);
        metrics.put("totalNewApplications", totalNewApplications);
        metrics.put("totalReviewedApplications", totalReviewedApplications);
        metrics.put("totalShortlistedApplications", totalShortlistedApplications);
        metrics.put("totalRejectedApplications", totalRejectedApplications);
        metrics.put("totalAutoAcceptedApplications", totalAutoAcceptedApplications);
        metrics.put("totalAutoRejectedApplications", totalAutoRejectedApplications);
        metrics.put("averageProcessingTimeMinutes", avgProcessingTime);
        metrics.put("averageScore", avgScore);
        metrics.put("shortlistRate", shortlistRate);
        metrics.put("rejectRate", rejectRate);
        metrics.put("autoDecisionRate", autoDecisionRate);

        // Ajouter la progression dans le temps
        Map<String, Object> timeSeriesData = new HashMap<>();

        List<String> dates = metricsForPeriod.stream()
                .map(m -> m.getMetricsDate().toString())
                .collect(Collectors.toList());

        List<Integer> newApplications = metricsForPeriod.stream()
                .map(Metrics::getNewApplications)
                .collect(Collectors.toList());

        List<Integer> reviewedApplications = metricsForPeriod.stream()
                .map(Metrics::getReviewedApplications)
                .collect(Collectors.toList());

        List<Integer> shortlistedApplications = metricsForPeriod.stream()
                .map(Metrics::getShortlistedApplications)
                .collect(Collectors.toList());

        List<Integer> rejectedApplications = metricsForPeriod.stream()
                .map(Metrics::getRejectedApplications)
                .collect(Collectors.toList());

        timeSeriesData.put("dates", dates);
        timeSeriesData.put("newApplications", newApplications);
        timeSeriesData.put("reviewedApplications", reviewedApplications);
        timeSeriesData.put("shortlistedApplications", shortlistedApplications);
        timeSeriesData.put("rejectedApplications", rejectedApplications);

        metrics.put("timeSeriesData", timeSeriesData);

        return metrics;
    }
}