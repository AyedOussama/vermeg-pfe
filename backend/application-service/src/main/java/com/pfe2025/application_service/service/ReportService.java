package com.pfe2025.application_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe2025.application_service.exception.InvalidOperationException;
import com.pfe2025.application_service.exception.ResourceNotFoundException;
import com.pfe2025.application_service.model.Application;
import com.pfe2025.application_service.model.Application.ApplicationStatus;
import com.pfe2025.application_service.model.Evaluation;
import com.pfe2025.application_service.model.Evaluation.EvaluationRecommendation;
import com.pfe2025.application_service.model.Report;
import com.pfe2025.application_service.model.Report.GenerationStatus;
import com.pfe2025.application_service.model.Report.ReportFormat;
import com.pfe2025.application_service.model.Report.ReportType;
import com.pfe2025.application_service.repository.ApplicationRepository;
import com.pfe2025.application_service.repository.EvaluationRepository;
import com.pfe2025.application_service.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Service pour la génération et la gestion des rapports.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@CacheConfig(cacheNames = "reports")
public class ReportService {

    private final ReportRepository reportRepository;
    private final ApplicationRepository applicationRepository;
    private final EvaluationRepository evaluationRepository;
    private final ObjectMapper objectMapper;

    /**
     * Récupère tous les rapports avec pagination.
     *
     * @param pageable Les informations de pagination
     * @return Une page de rapports
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'all-page-' + #pageable.pageNumber")
    public Page<Report> getAllReports(Pageable pageable) {
        log.debug("Retrieving all reports with pagination (page={})", pageable.getPageNumber());
        return reportRepository.findAll(pageable);
    }

    /**
     * Récupère un rapport par son ID.
     *
     * @param id L'ID du rapport
     * @return Le rapport
     * @throws ResourceNotFoundException Si le rapport n'est pas trouvé
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "#id")
    public Report getReport(Long id) {
        log.debug("Retrieving report with ID: {}", id);
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));
    }

    /**
     * Récupère les rapports créés par un utilisateur spécifique.
     *
     * @param userId L'ID de l'utilisateur
     * @param pageable Les informations de pagination
     * @return Une page de rapports
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'user-' + #userId + '-page-' + #pageable.pageNumber")
    public Page<Report> getReportsByCreator(String userId, Pageable pageable) {
        log.debug("Retrieving reports created by user: {}", userId);
        return reportRepository.findByCreatedBy(userId, pageable);
    }

    /**
     * Génère un nouveau rapport basé sur les paramètres fournis.
     *
     * @param title Le titre du rapport
     * @param description La description du rapport
     * @param reportType Le type de rapport
     * @param parameters Les paramètres pour le rapport
     * @param format Le format de sortie
     * @param userId L'ID de l'utilisateur créant le rapport
     * @return Le rapport créé
     * @throws InvalidOperationException Si les paramètres sont invalides
     */
    @Transactional
    @CacheEvict(allEntries = true)
    public Report generateReport(String title, String description, ReportType reportType,
                                 Map<String, Object> parameters, ReportFormat format, String userId) {
        log.debug("Generating report '{}' of type {}", title, reportType);

        try {
            // Valider les paramètres pour le type de rapport
            validateReportParameters(reportType, parameters);

            // Créer l'entité rapport
            Report report = Report.builder()
                    .title(title)
                    .description(description)
                    .reportType(reportType)
                    .parameters(objectMapper.writeValueAsString(parameters))
                    .format(format)
                    .createdBy(userId)
                    .createdAt(LocalDateTime.now())
                    .generationStatus(GenerationStatus.PENDING)
                    .isScheduled(false)
                    .build();

            // Extraire les dates des paramètres
            if (parameters.containsKey("startDate")) {
                report.setStartDate(LocalDate.parse((String) parameters.get("startDate")));
            }

            if (parameters.containsKey("endDate")) {
                report.setEndDate(LocalDate.parse((String) parameters.get("endDate")));
            }

            // Extraire l'ID de l'offre d'emploi
            if (parameters.containsKey("jobPostingId")) {
                report.setJobPostingId(Long.valueOf(parameters.get("jobPostingId").toString()));
            }

            // Extraire le département
            if (parameters.containsKey("department")) {
                report.setDepartment((String) parameters.get("department"));
            }

            // Sauvegarder le rapport initial
            report = reportRepository.save(report);
            final Long reportId = report.getId();

            // Générer le rapport de façon asynchrone
            CompletableFuture.runAsync(() -> generateReportContent(reportId));

            return report;

        } catch (JsonProcessingException e) {
            log.error("Error serializing report parameters: {}", e.getMessage(), e);
            throw new InvalidOperationException("Error serializing report parameters: " + e.getMessage());
        }
    }

    /**
     * Télécharge un rapport.
     *
     * @param id L'ID du rapport
     * @param userId L'ID de l'utilisateur téléchargeant le rapport
     * @return Le rapport sous forme de ressource
     * @throws ResourceNotFoundException Si le rapport n'est pas trouvé
     * @throws InvalidOperationException Si le rapport n'est pas prêt
     */
    @Transactional(readOnly = true)
    public Resource downloadReport(Long id, String userId) {
        log.debug("Downloading report with ID: {}", id);

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));

        // Vérifier si le rapport est prêt
        if (report.getGenerationStatus() != GenerationStatus.COMPLETED) {
            throw new InvalidOperationException(
                    "Report is not ready for download. Current status: " + report.getGenerationStatus());
        }

        // Retourner les données du rapport sous forme de ressource
        if (report.getResultData() != null && !report.getResultData().isEmpty()) {
            byte[] data = report.getResultData().getBytes(StandardCharsets.UTF_8);
            return new ByteArrayResource(data);
        }

        throw new InvalidOperationException("Report data is not available");
    }

    /**
     * Supprime un rapport.
     *
     * @param id L'ID du rapport
     * @throws ResourceNotFoundException Si le rapport n'est pas trouvé
     */
    @Transactional
    @CacheEvict(key = "#id")
    public void deleteReport(Long id) {
        log.debug("Deleting report with ID: {}", id);

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));

        reportRepository.delete(report);
        log.info("Report with ID {} deleted successfully", id);
    }

    /**
     * Récupère les métriques pour le tableau de bord.
     *
     * @return Une carte de métriques
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'dashboard-metrics'")
    public Map<String, Object> getDashboardMetrics() {
        log.debug("Getting dashboard metrics");

        Map<String, Object> metrics = new HashMap<>();

        // Statistiques des candidatures
        long totalApplications = applicationRepository.count();

        // Compter par statut
        Map<String, Long> statusCounts = applicationRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        app -> app.getStatus().name(),
                        Collectors.counting()
                ));

        metrics.put("totalApplications", totalApplications);
        metrics.put("statusCounts", statusCounts);

        // Statistiques d'évaluation
        Long totalEvaluations = evaluationRepository.count();
        metrics.put("totalEvaluations", totalEvaluations);

        // Rapports récents
        List<Report> recentReports = reportRepository.findTop5ByOrderByCreatedAtDesc();
        metrics.put("recentReports", recentReports.stream()
                .map(report -> Map.of(
                        "id", report.getId(),
                        "title", report.getTitle(),
                        "type", report.getReportType().name(),
                        "createdAt", report.getCreatedAt()
                ))
                .collect(Collectors.toList()));

        // Tendance des candidatures hebdomadaires
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);

        // Utiliser le dépôt d'applications pour compter les candidatures par date
        List<Object[]> dailyCounts = applicationRepository.countBySubmissionDateBetween(weekAgo, today);
        Map<String, Long> dailyTrend = new HashMap<>();

        for (Object[] row : dailyCounts) {
            LocalDate date = (LocalDate) row[0];
            Long count = (Long) row[1];
            dailyTrend.put(date.toString(), count);
        }

        metrics.put("weeklyApplicationTrend", dailyTrend);

        return metrics;
    }

    /**
     * Génère de façon asynchrone le contenu d'un rapport.
     *
     * @param reportId L'ID du rapport à générer
     */
    @Async("reportTaskExecutor")
    protected void generateReportContent(Long reportId) {
        log.debug("Asynchronously generating report with ID: {}", reportId);

        try {
            // Récupérer le rapport
            Report report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + reportId));

            // Mettre à jour le statut en traitement
            report.setGenerationStatus(GenerationStatus.PROCESSING);
            report = reportRepository.save(report);

            // Analyser les paramètres
            Map<String, Object> parameters;
            try {
                parameters = objectMapper.readValue(report.getParameters(),
                        new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                throw new InvalidOperationException("Error deserializing report parameters: " + e.getMessage());
            }

            // Générer le contenu basé sur le type de rapport
            Map<String, Object> reportData;
            switch (report.getReportType()) {
                case JOB_POSTING_ANALYTICS:
                    reportData = generateJobPostingAnalytics(report, parameters);
                    break;
                case EVALUATION_ACCURACY:
                    reportData = generateEvaluationAccuracy(report, parameters);
                    break;
                default:
                    throw new InvalidOperationException("Unsupported report type: " + report.getReportType());
            }

            // Formater le contenu en fonction du format
            String formattedContent;
            switch (report.getFormat()) {
                case JSON:
                    formattedContent = objectMapper.writerWithDefaultPrettyPrinter()
                            .writeValueAsString(reportData);
                    break;
                case CSV:
                    formattedContent = generateCsvContent(reportData);
                    break;
                case PDF:
                case EXCEL:
                    // Pour PDF et Excel, utiliser temporairement le format JSON
                    // Dans un environnement de production, utiliser des bibliothèques comme iText pour PDF ou POI pour Excel
                    formattedContent = objectMapper.writerWithDefaultPrettyPrinter()
                            .writeValueAsString(reportData);
                    break;
                default:
                    throw new InvalidOperationException("Unsupported report format: " + report.getFormat());
            }

            // Mettre à jour le rapport avec le contenu généré
            report.setResultData(formattedContent);
            report.setGenerationStatus(GenerationStatus.COMPLETED);
            report.setLastGeneratedAt(LocalDateTime.now());
            reportRepository.save(report);

            log.info("Report with ID {} generated successfully", reportId);

        } catch (Exception e) {
            log.error("Error generating report with ID {}: {}", reportId, e.getMessage(), e);

            // Mettre à jour le statut en cas d'erreur
            try {
                Report report = reportRepository.findById(reportId).orElse(null);
                if (report != null) {
                    report.setGenerationStatus(GenerationStatus.FAILED);
                    report.setErrorMessage(e.getMessage());
                    reportRepository.save(report);
                }
            } catch (Exception ex) {
                log.error("Error updating report status: {}", ex.getMessage(), ex);
            }
        }
    }

    /**
     * Génère un rapport d'analyse d'offre d'emploi.
     *
     * @param report L'entité rapport
     * @param parameters Les paramètres du rapport
     * @return Les données du rapport
     */
    private Map<String, Object> generateJobPostingAnalytics(Report report, Map<String, Object> parameters) {
        log.debug("Generating job posting analytics report with parameters: {}", parameters);

        Map<String, Object> reportData = new HashMap<>();
        reportData.put("reportType", report.getReportType().name());
        reportData.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        // Extraire l'ID de l'offre d'emploi
        Long jobPostingId = Long.valueOf(parameters.get("jobPostingId").toString());

        // Récupérer les candidatures pour cette offre
        List<Application> applications = applicationRepository.findAllByJobPostingId(jobPostingId);

        // Informations générales
        reportData.put("jobPostingId", jobPostingId);
        reportData.put("totalApplications", applications.size());

        // Récupérer le titre de l'offre à partir de la première candidature (si disponible)
        if (!applications.isEmpty() && applications.get(0).getJobTitle() != null) {
            reportData.put("jobTitle", applications.get(0).getJobTitle());
        } else {
            reportData.put("jobTitle", "Job #" + jobPostingId);
        }

        // Comptage par statut
        Map<String, Long> statusCounts = applications.stream()
                .collect(Collectors.groupingBy(
                        app -> app.getStatus().name(),
                        Collectors.counting()
                ));
        reportData.put("statusCounts", statusCounts);

        // Calculer le taux de conversion
        long shortlistedCount = applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SHORTLISTED ||
                        app.getStatus() == ApplicationStatus.INTERVIEW_REQUESTED ||
                        app.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED ||
                        app.getStatus() == ApplicationStatus.INTERVIEW_COMPLETED ||
                        app.getStatus() == ApplicationStatus.OFFER_EXTENDED ||
                        app.getStatus() == ApplicationStatus.HIRED)
                .count();

        double conversionRate = applications.isEmpty() ? 0.0 :
                (double) shortlistedCount / applications.size() * 100;
        reportData.put("shortlistedCount", shortlistedCount);
        reportData.put("conversionRate", conversionRate);

        // Score moyen
        Double avgScore = applications.stream()
                .filter(app -> app.getAiScore() != null)
                .mapToDouble(Application::getAiScore)
                .average()
                .orElse(0.0);
        reportData.put("averageScore", avgScore);

        // Distribution des scores
        Map<String, Long> scoreDistribution = applications.stream()
                .filter(app -> app.getAiScore() != null)
                .collect(Collectors.groupingBy(
                        app -> {
                            double score = app.getAiScore();
                            if (score >= 90) return "90-100";
                            if (score >= 80) return "80-89";
                            if (score >= 70) return "70-79";
                            if (score >= 60) return "60-69";
                            if (score >= 50) return "50-59";
                            return "0-49";
                        },
                        Collectors.counting()
                ));
        reportData.put("scoreDistribution", scoreDistribution);

        // Métriques d'automatisation
        long autoDecisionCount = applications.stream()
                .filter(app -> Boolean.TRUE.equals(app.getAutoDecision()))
                .count();
        double autoDecisionRate = applications.isEmpty() ? 0.0 :
                (double) autoDecisionCount / applications.size() * 100;
        reportData.put("autoDecisionCount", autoDecisionCount);
        reportData.put("autoDecisionRate", autoDecisionRate);

        // Métriques de temps de traitement
        OptionalDouble avgProcessingTime = applications.stream()
                .filter(app -> app.getProcessedAt() != null && app.getSubmittedAt() != null)
                .mapToLong(app -> ChronoUnit.HOURS.between(app.getSubmittedAt(), app.getProcessedAt()))
                .average();
        reportData.put("averageProcessingTimeHours", avgProcessingTime.orElse(0.0));

        return reportData;
    }

    /**
     * Génère un rapport de précision d'évaluation.
     *
     * @param report L'entité rapport
     * @param parameters Les paramètres du rapport
     * @return Les données du rapport
     */
    private Map<String, Object> generateEvaluationAccuracy(Report report, Map<String, Object> parameters) {
        log.debug("Generating evaluation accuracy report with parameters: {}", parameters);

        Map<String, Object> reportData = new HashMap<>();
        reportData.put("reportType", report.getReportType().name());
        reportData.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        // Extraire les paramètres
        LocalDate startDate = report.getStartDate();
        LocalDate endDate = report.getEndDate();
        String department = (String) parameters.get("department");

        reportData.put("startDate", startDate);
        reportData.put("endDate", endDate);
        reportData.put("department", department);

        // Récupérer les évaluations
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay().minusSeconds(1);

        List<Evaluation> evaluations = evaluationRepository.findByDepartmentAndDateRange(
                department, startDateTime, endDateTime);

        // Statistiques générales
        reportData.put("totalEvaluations", evaluations.size());

        // Calculer la précision globale
        long correctDecisions = evaluations.stream()
                .filter(eval -> {
                    Application app = eval.getApplication();

                    // Vérifier si la recommandation IA correspond au statut final
                    if (eval.getRecommendation() == EvaluationRecommendation.ACCEPT) {
                        return app.getStatus() == ApplicationStatus.SHORTLISTED ||
                                app.getStatus() == ApplicationStatus.INTERVIEW_REQUESTED ||
                                app.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED ||
                                app.getStatus() == ApplicationStatus.INTERVIEW_COMPLETED ||
                                app.getStatus() == ApplicationStatus.OFFER_EXTENDED ||
                                app.getStatus() == ApplicationStatus.HIRED;
                    } else if (eval.getRecommendation() == EvaluationRecommendation.REJECT) {
                        return app.getStatus() == ApplicationStatus.REJECTED;
                    }

                    // Pour REVIEW ou FURTHER_INFO, impossible de déterminer
                    return false;
                })
                .count();

        double accuracy = evaluations.isEmpty() ? 0.0 :
                (double) correctDecisions / evaluations.size() * 100;
        reportData.put("globalAccuracy", accuracy);

        // Calculer les faux positifs et faux négatifs
        long falsePositives = evaluations.stream()
                .filter(eval ->
                        eval.getRecommendation() == EvaluationRecommendation.ACCEPT &&
                                eval.getApplication().getStatus() == ApplicationStatus.REJECTED)
                .count();

        long falseNegatives = evaluations.stream()
                .filter(eval ->
                        eval.getRecommendation() == EvaluationRecommendation.REJECT &&
                                (eval.getApplication().getStatus() == ApplicationStatus.SHORTLISTED ||
                                        eval.getApplication().getStatus() == ApplicationStatus.INTERVIEW_REQUESTED ||
                                        eval.getApplication().getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED ||
                                        eval.getApplication().getStatus() == ApplicationStatus.INTERVIEW_COMPLETED ||
                                        eval.getApplication().getStatus() == ApplicationStatus.OFFER_EXTENDED ||
                                        eval.getApplication().getStatus() == ApplicationStatus.HIRED))
                .count();

        double falsePositiveRate = evaluations.isEmpty() ? 0.0 :
                (double) falsePositives / evaluations.size() * 100;
        double falseNegativeRate = evaluations.isEmpty() ? 0.0 :
                (double) falseNegatives / evaluations.size() * 100;

        reportData.put("falsePositiveCount", falsePositives);
        reportData.put("falseNegativeCount", falseNegatives);
        reportData.put("falsePositiveRate", falsePositiveRate);
        reportData.put("falseNegativeRate", falseNegativeRate);

        // Recommandations pour le calibrage
        List<String> calibrationRecommendations = new ArrayList<>();

        if (falsePositiveRate > 10.0) {
            calibrationRecommendations.add("Augmenter les seuils d'acceptation automatique pour réduire les faux positifs");
        }

        if (falseNegativeRate > 10.0) {
            calibrationRecommendations.add("Diminuer les seuils de rejet automatique pour réduire les faux négatifs");
        }

        reportData.put("calibrationRecommendations", calibrationRecommendations);

        // Distribution des recommandations
        Map<String, Long> recommendationDistribution = evaluations.stream()
                .collect(Collectors.groupingBy(
                        eval -> eval.getRecommendation().name(),
                        Collectors.counting()
                ));
        reportData.put("recommendationDistribution", recommendationDistribution);

        return reportData;
    }

    /**
     * Génère du contenu CSV à partir des données du rapport.
     *
     * @param reportData Les données du rapport
     * @return Le contenu CSV
     */
    private String generateCsvContent(Map<String, Object> reportData) {
        StringBuilder csvContent = new StringBuilder();

        // En-tête
        csvContent.append("Key,Value\n");

        // Traiter les données de premier niveau
        for (Map.Entry<String, Object> entry : reportData.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if (value instanceof String || value instanceof Number || value instanceof Boolean) {
                // Valeurs simples
                csvContent.append(escapeCsv(key)).append(",").append(escapeCsv(value.toString())).append("\n");
            } else if (value instanceof Map) {
                // Traiter les maps imbriquées
                @SuppressWarnings("unchecked")
                Map<String, Object> nestedMap = (Map<String, Object>) value;
                for (Map.Entry<String, Object> nestedEntry : nestedMap.entrySet()) {
                    String nestedKey = key + "." + nestedEntry.getKey();
                    Object nestedValue = nestedEntry.getValue();

                    if (nestedValue instanceof String || nestedValue instanceof Number || nestedValue instanceof Boolean) {
                        csvContent.append(escapeCsv(nestedKey)).append(",").append(escapeCsv(nestedValue.toString())).append("\n");
                    }
                }
            } else if (value instanceof List) {
                // Traiter les listes
                @SuppressWarnings("unchecked")
                List<Object> list = (List<Object>) value;
                for (int i = 0; i < list.size(); i++) {
                    Object listItem = list.get(i);
                    String listKey = key + "[" + i + "]";

                    if (listItem instanceof String || listItem instanceof Number || listItem instanceof Boolean) {
                        csvContent.append(escapeCsv(listKey)).append(",").append(escapeCsv(listItem.toString())).append("\n");
                    }
                }
            }
        }

        return csvContent.toString();
    }

    /**
     * Échappe les caractères spéciaux pour le format CSV.
     *
     * @param value La valeur à échapper
     * @return La valeur échappée
     */
    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }

        // Si la valeur contient une virgule, des guillemets ou un saut de ligne, l'entourer de guillemets
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            // Doubler les guillemets pour les échapper
            String escaped = value.replace("\"", "\"\"");
            return "\"" + escaped + "\"";
        }

        return value;
    }

    /**
     * Valide les paramètres pour un rapport.
     *
     * @param reportType Le type de rapport
     * @param parameters Les paramètres à valider
     * @throws InvalidOperationException Si les paramètres sont invalides
     */
    private void validateReportParameters(ReportType reportType, Map<String, Object> parameters) {
        switch (reportType) {
            case JOB_POSTING_ANALYTICS:
                if (!parameters.containsKey("jobPostingId")) {
                    throw new InvalidOperationException("L'ID de l'offre d'emploi est requis pour les rapports d'analyse de poste");
                }
                break;

            case EVALUATION_ACCURACY:
                // Vérifier les dates requises
                if (!parameters.containsKey("startDate") || !parameters.containsKey("endDate")) {
                    throw new InvalidOperationException("Les dates de début et de fin sont requises pour les rapports de précision d'évaluation");
                }

                // Valider le format et la plage des dates
                try {
                    LocalDate startDate = LocalDate.parse((String) parameters.get("startDate"));
                    LocalDate endDate = LocalDate.parse((String) parameters.get("endDate"));

                    if (startDate.isAfter(endDate)) {
                        throw new InvalidOperationException("La date de début doit être antérieure à la date de fin");
                    }
                } catch (Exception e) {
                    throw new InvalidOperationException("Format de date invalide. Utilisez le format ISO (AAAA-MM-JJ)");
                }
                break;

            default:
                throw new InvalidOperationException("Type de rapport non pris en charge: " + reportType);
        }
    }
}