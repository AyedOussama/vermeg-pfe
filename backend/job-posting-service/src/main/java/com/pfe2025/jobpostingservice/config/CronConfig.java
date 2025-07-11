package com.pfe2025.jobpostingservice.config;




import com.pfe2025.jobpostingservice.service.JobPostService;
import com.pfe2025.jobpostingservice.service.MetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Configuration des tâches planifiées pour l'application.
 * Permet d'exécuter automatiquement certaines tâches à intervalles réguliers.
 */
@Configuration
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class CronConfig {

    private final JobPostService jobPostService;
    private final MetricsService metricsService;

    /**
     * Tâche planifiée pour la mise à jour des offres expirées.
     * S'exécute toutes les heures pour vérifier et marquer les offres expirées.
     */
    @Scheduled(cron = "0 0 * * * *") // Toutes les heures
    public void updateExpiredJobPosts() {
        log.info("Executing scheduled task: updateExpiredJobPosts");
        try {
            int count = jobPostService.updateExpiredJobPosts();
            log.info("Marked {} job posts as expired", count);
        } catch (Exception e) {
            log.error("Error during scheduled task: updateExpiredJobPosts", e);
        }
    }

    /**
     * Tâche planifiée pour générer les snapshots quotidiens de métriques.
     * S'exécute tous les jours à minuit pour créer des snapshots des métriques de la journée.
     */
    @Scheduled(cron = "0 0 0 * * *") // Tous les jours à minuit
    public void generateDailyMetricsSnapshots() {
        log.info("Executing scheduled task: generateDailyMetricsSnapshots");
        try {
            int count = metricsService.generateDailySnapshots();
            log.info("Generated {} daily metrics snapshots", count);
        } catch (Exception e) {
            log.error("Error during scheduled task: generateDailyMetricsSnapshots", e);
        }
    }

    /**
     * Tâche planifiée pour envoyer des notifications pour les offres qui vont bientôt expirer.
     * S'exécute tous les jours à 8h du matin pour identifier les offres qui expirent dans les 3 jours.
     */
    @Scheduled(cron = "0 0 8 * * *") // Tous les jours à 8h
    public void notifyOfSoonExpiringJobPosts() {
        log.info("Executing scheduled task: notifyOfSoonExpiringJobPosts");
        try {
            int count = jobPostService.identifySoonExpiringJobPosts(3); // Expire dans 3 jours
            log.info("Identified {} job posts expiring soon", count);
        } catch (Exception e) {
            log.error("Error during scheduled task: notifyOfSoonExpiringJobPosts", e);
        }
    }

    /**
     * Tâche planifiée pour les opérations de maintenance du cache.
     * S'exécute tous les jours à 2h du matin pour effectuer des opérations de nettoyage.
     */
    @Scheduled(cron = "0 0 2 * * *") // Tous les jours à 2h
    public void cacheMaintenance() {
        log.info("Executing scheduled task: cacheMaintenance");
        try {
            // Rafraîchir le cache des offres publiées
            jobPostService.refreshPublishedJobPostsCache();
            log.info("Cache maintenance completed successfully");
        } catch (Exception e) {
            log.error("Error during scheduled task: cacheMaintenance", e);
        }
    }
}
