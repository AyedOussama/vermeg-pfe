package com.pfe2025.jobpostingservice.util;



import com.pfe2025.jobpostingservice.model.MetricsDailySnapshot;
import com.pfe2025.jobpostingservice.model.PostingMetrics;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Calculateur de métriques pour les offres d'emploi.
 */
public class MetricsCalculator {

    private MetricsCalculator() {
        // Classe utilitaire, constructeur privé
    }

    /**
     * Calcule le taux de conversion (candidatures / vues uniques).
     *
     * @param uniqueViews Nombre de vues uniques
     * @param applications Nombre de candidatures
     * @return Le taux de conversion en pourcentage
     */
    public static double calculateConversionRate(int uniqueViews, int applications) {
        if (uniqueViews == 0) {
            return 0.0;
        }
        return (double) applications / uniqueViews * 100.0;
    }

    /**
     * Calcule les métriques agrégées pour une période donnée.
     *
     * @param metrics Les métriques complètes
     * @param startDate Date de début de la période
     * @param endDate Date de fin de la période
     * @return Un tableau avec les vues, vues uniques, candidatures et taux de conversion
     */
    public static int[] calculateMetricsForPeriod(PostingMetrics metrics, LocalDate startDate, LocalDate endDate) {
        int viewCount = 0;
        int uniqueViewCount = 0;
        int applicationCount = 0;

        // Filtrer les snapshots pour la période donnée
        for (MetricsDailySnapshot snapshot : metrics.getDailySnapshots()) {
            if (!snapshot.getDate().isBefore(startDate) && !snapshot.getDate().isAfter(endDate)) {
                viewCount += snapshot.getDailyViewCount();
                uniqueViewCount += snapshot.getDailyUniqueViewCount();
                applicationCount += snapshot.getDailyApplicationCount();
            }
        }

        double conversionRate = calculateConversionRate(uniqueViewCount, applicationCount);

        return new int[] {viewCount, uniqueViewCount, applicationCount, (int) Math.round(conversionRate)};
    }

    /**
     * Groupe les snapshots par jour pour la visualisation.
     *
     * @param metrics Les métriques complètes
     * @param days Nombre de jours à inclure
     * @return Une map avec les dates et les métriques associées
     */
    public static Map<LocalDate, int[]> getMetricsByDay(PostingMetrics metrics, int days) {
        // Générer la liste des N derniers jours
        List<LocalDate> dateRange = DateUtils.getLastNDays(days);

        // Convertir les snapshots en map pour un accès facile
        Map<LocalDate, MetricsDailySnapshot> snapshotMap = metrics.getDailySnapshots().stream()
                .collect(Collectors.toMap(MetricsDailySnapshot::getDate, snapshot -> snapshot));

        // Créer le résultat avec les données disponibles ou des zéros
        return dateRange.stream()
                .collect(Collectors.toMap(
                        date -> date,
                        date -> {
                            if (snapshotMap.containsKey(date)) {
                                MetricsDailySnapshot snapshot = snapshotMap.get(date);
                                return new int[] {
                                        snapshot.getDailyViewCount(),
                                        snapshot.getDailyUniqueViewCount(),
                                        snapshot.getDailyApplicationCount()
                                };
                            } else {
                                return new int[] {0, 0, 0};
                            }
                        }
                ));
    }
}
