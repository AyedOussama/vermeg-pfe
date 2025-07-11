package com.pfe2025.jobpostingservice.service;

import com.pfe2025.jobpostingservice.dto.MetricsDailySnapshotDTO;
import com.pfe2025.jobpostingservice.dto.PostingMetricsDTO;
import com.pfe2025.jobpostingservice.exception.ResourceNotFoundException;

import com.pfe2025.jobpostingservice.mapper.PostingMetricsMapper;
import com.pfe2025.jobpostingservice.model.*;
import com.pfe2025.jobpostingservice.repository.JobPostRepository;
import com.pfe2025.jobpostingservice.repository.MetricsDailySnapshotRepository;

import com.pfe2025.jobpostingservice.repository.PostingMetricsRepository;
import com.pfe2025.jobpostingservice.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service de gestion des métriques des offres d'emploi.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

    private final PostingMetricsRepository metricsRepository;
    private final MetricsDailySnapshotRepository snapshotRepository;
    private final JobPostRepository jobPostRepository;
    private final PostingMetricsMapper metricsMapper;

    /**
     * Récupère les métriques d'une offre d'emploi.
     *
     * @param jobPostId L'identifiant de l'offre
     * @return Les métriques
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "metrics", key = "#jobPostId")
    public PostingMetricsDTO getMetricsForJobPost(Long jobPostId) {
        log.debug("Fetching metrics for job post ID: {}", jobPostId);

        PostingMetrics metrics = metricsRepository.findByJobPostIdWithSnapshots(jobPostId)
                .orElseThrow(() -> new ResourceNotFoundException("Metrics not found for job post ID: " + jobPostId));

        return metricsMapper.toDto(metrics);
    }

    /**
     * Incrémente le compteur de vues pour une offre d'emploi.
     *
     * @param jobPostId L'identifiant de l'offre
     * @param isUnique Indique s'il s'agit d'une vue unique
     */
    @Async("metricsExecutor")
    @Transactional
    @CacheEvict(value = "metrics", key = "#jobPostId")
    public void incrementViewCount(Long jobPostId, boolean isUnique) {
        log.debug("Incrementing view count for job post ID: {}, unique: {}", jobPostId, isUnique);

        PostingMetrics metrics = metricsRepository.findByJobPostId(jobPostId)
                .orElseGet(() -> initializeMetrics(jobPostId));

        // Incrémenter les compteurs
        metrics.incrementViews(isUnique);
        metrics.setLastUpdated(LocalDateTime.now());

        // Mettre à jour les snapshots quotidiens
        updateDailySnapshot(metrics, true, isUnique, false);

        metricsRepository.save(metrics);
        log.debug("Incremented view count for job post ID: {}", jobPostId);
    }

    /**
     * Incrémente le compteur de candidatures pour une offre d'emploi.
     *
     * @param jobPostId L'identifiant de l'offre
     */
    @Async("metricsExecutor")
    @Transactional
    @CacheEvict(value = "metrics", key = "#jobPostId")
    public void incrementApplicationCount(Long jobPostId) {
        log.debug("Incrementing application count for job post ID: {}", jobPostId);

        PostingMetrics metrics = metricsRepository.findByJobPostId(jobPostId)
                .orElseGet(() -> initializeMetrics(jobPostId));

        // Incrémenter le compteur
        metrics.incrementApplications();
        metrics.setLastUpdated(LocalDateTime.now());

        // Mettre à jour les snapshots quotidiens
        updateDailySnapshot(metrics, false, false, true);

        metricsRepository.save(metrics);
        log.debug("Incremented application count for job post ID: {}", jobPostId);
    }

    /**
     * Génère les snapshots quotidiens pour toutes les offres actives.
     *
     * @return Le nombre de snapshots générés
     */
    @Transactional
    public int generateDailySnapshots() {
        log.debug("Generating daily metrics snapshots");

        LocalDate today = LocalDate.now();
        List<PostingMetrics> allMetrics = metricsRepository.findAll();
        int count = 0;

        for (PostingMetrics metrics : allMetrics) {
            // Vérifier si un snapshot existe déjà pour aujourd'hui
            Optional<MetricsDailySnapshot> existingSnapshot =
                    snapshotRepository.findByMetricsIdAndDate(metrics.getId(), today);

            if (existingSnapshot.isEmpty()) {
                // Créer un nouveau snapshot avec les valeurs actuelles
                MetricsDailySnapshot snapshot = MetricsDailySnapshot.builder()
                        .metrics(metrics)
                        .date(today)
                        .dailyViewCount(0)
                        .dailyUniqueViewCount(0)
                        .dailyApplicationCount(0)
                        .build();

                metrics.addDailySnapshot(snapshot);
                metricsRepository.save(metrics);
                count++;
            }
        }

        log.info("Generated {} daily metrics snapshots", count);
        return count;
    }

    /**
     * Obtient les métriques par département.
     *
     * @return Un dictionnaire des métriques par département
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "departmentMetrics")
    public Map<String, Map<String, Object>> getMetricsByDepartment() {
        log.debug("Getting metrics by department");

        List<Object[]> results = metricsRepository.getMetricsByDepartment();
        Map<String, Map<String, Object>> departmentMetrics = new HashMap<>();

        for (Object[] result : results) {
            String department = (String) result[0];
            Long totalViews = ((Number) result[1]).longValue();
            Long uniqueViews = ((Number) result[2]).longValue();
            Long applications = ((Number) result[3]).longValue();
            Double conversionRate = (Double) result[4];

            Map<String, Object> metrics = new HashMap<>();
            metrics.put("totalViews", totalViews);
            metrics.put("uniqueViews", uniqueViews);
            metrics.put("applications", applications);
            metrics.put("conversionRate", conversionRate);

            departmentMetrics.put(department, metrics);
        }

        return departmentMetrics;
    }

    /**
     * Obtient les snapshots quotidiens pour une période donnée.
     *
     * @param jobPostId L'identifiant de l'offre
     * @param days Le nombre de jours à récupérer
     * @return La liste des snapshots
     */
    @Transactional(readOnly = true)
    public List<MetricsDailySnapshotDTO> getDailyMetricsForJobPost(Long jobPostId, int days) {
        log.debug("Getting daily metrics for job post ID: {} for the last {} days", jobPostId, days);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        PostingMetrics metrics = metricsRepository.findByJobPostId(jobPostId)
                .orElseThrow(() -> new ResourceNotFoundException("Metrics not found for job post ID: " + jobPostId));

        List<MetricsDailySnapshot> snapshots = snapshotRepository.findByMetricsIdAndDateBetween(
                metrics.getId(), startDate, endDate);

        // Compléter les jours manquants avec des snapshots vides
        List<LocalDate> allDates = DateUtils.getLastNDays(days);
        Map<LocalDate, MetricsDailySnapshot> snapshotsByDate = new HashMap<>();

        // Indexer les snapshots existants par date
        for (MetricsDailySnapshot snapshot : snapshots) {
            snapshotsByDate.put(snapshot.getDate(), snapshot);
        }

        // Créer une liste complète incluant des snapshots vides pour les dates manquantes
        return allDates.stream()
                .map(date -> {
                    MetricsDailySnapshot snapshot = snapshotsByDate.getOrDefault(date,
                            MetricsDailySnapshot.builder()
                                    .metrics(metrics)
                                    .date(date)
                                    .dailyViewCount(0)
                                    .dailyUniqueViewCount(0)
                                    .dailyApplicationCount(0)
                                    .build());
                    return metricsMapper.toDto(snapshot);
                })
                .toList();
    }

    /**
     * Récupère les offres avec le plus de candidatures.
     *
     * @param limit Le nombre maximum de résultats
     * @return La liste des métriques
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "topMetrics", key = "'applications_' + #limit")
    public List<PostingMetricsDTO> getTopByApplications(int limit) {
        log.debug("Getting top {} job posts by applications", limit);

        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(0, limit);

        List<PostingMetrics> topMetrics = metricsRepository.findTopByApplications(pageable);
        return topMetrics.stream()
                .map(metricsMapper::toDto)
                .toList();
    }

    /**
     * Récupère les offres avec le meilleur taux de conversion.
     *
     * @param limit Le nombre maximum de résultats
     * @return La liste des métriques
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "topMetrics", key = "'conversion_' + #limit")
    public List<PostingMetricsDTO> getTopByConversionRate(int limit) {
        log.debug("Getting top {} job posts by conversion rate", limit);

        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(0, limit);

        List<PostingMetrics> topMetrics = metricsRepository.findTopByConversionRate(pageable);
        return topMetrics.stream()
                .map(metricsMapper::toDto)
                .toList();
    }

    /**
     * Initialise les métriques pour une offre d'emploi.
     *
     * @param jobPostId L'identifiant de l'offre
     * @return Les métriques initialisées
     */
    private PostingMetrics initializeMetrics(Long jobPostId) {
        log.debug("Initializing metrics for job post ID: {}", jobPostId);

        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found with ID: " + jobPostId));

        PostingMetrics metrics = PostingMetrics.builder()
                .jobPost(jobPost)
                .totalViewCount(0)
                .uniqueViewCount(0)
                .totalApplicationCount(0)
                .conversionRate(0.0)
                .lastUpdated(LocalDateTime.now())
                .build();

        return metricsRepository.save(metrics);
    }

    /**
     * Met à jour le snapshot quotidien des métriques.
     *
     * @param metrics Les métriques à mettre à jour
     * @param incrementView Incrémenter le compteur de vues
     * @param incrementUniqueView Incrémenter le compteur de vues uniques
     * @param incrementApplication Incrémenter le compteur de candidatures
     */
    private void updateDailySnapshot(PostingMetrics metrics, boolean incrementView,
                                     boolean incrementUniqueView, boolean incrementApplication) {
        LocalDate today = LocalDate.now();

        // Trouver ou créer le snapshot pour aujourd'hui
        MetricsDailySnapshot snapshot = metrics.getDailySnapshots().stream()
                .filter(s -> s.getDate().equals(today))
                .findFirst()
                .orElseGet(() -> {
                    MetricsDailySnapshot newSnapshot = MetricsDailySnapshot.builder()
                            .metrics(metrics)
                            .date(today)
                            .dailyViewCount(0)
                            .dailyUniqueViewCount(0)
                            .dailyApplicationCount(0)
                            .build();
                    metrics.addDailySnapshot(newSnapshot);
                    return newSnapshot;
                });

        // Mettre à jour les compteurs
        if (incrementView) {
            snapshot.setDailyViewCount(snapshot.getDailyViewCount() + 1);
        }
        if (incrementUniqueView) {
            snapshot.setDailyUniqueViewCount(snapshot.getDailyUniqueViewCount() + 1);
        }
        if (incrementApplication) {
            snapshot.setDailyApplicationCount(snapshot.getDailyApplicationCount() + 1);
        }
    }
}
