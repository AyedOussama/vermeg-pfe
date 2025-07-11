package com.pfe2025.jobpostingservice.config;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration pour les traitements asynchrones.
 * Permet d'exécuter certaines tâches en arrière-plan sans bloquer le thread principal.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Configure l'exécuteur de tâches asynchrones par défaut.
     *
     * @return Un exécuteur configuré
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("JobPostAsync-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    /**
     * Configure un exécuteur spécifique pour le traitement des métriques.
     * Ce pool séparé évite que les opérations de métriques n'affectent les autres traitements.
     *
     * @return Un exécuteur configuré pour les métriques
     */
    @Bean(name = "metricsExecutor")
    public Executor metricsExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(10);
        executor.setThreadNamePrefix("MetricsAsync-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.initialize();
        return executor;
    }

    /**
     * Configure un exécuteur spécifique pour les appels à l'API d'IA.
     * Ce pool séparé permet de limiter et contrôler les appels aux services externes.
     *
     * @return Un exécuteur configuré pour les appels d'IA
     */
    @Bean(name = "aiExecutor")
    public Executor aiExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(5);
        executor.setThreadNamePrefix("AIAsync-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.initialize();
        return executor;
    }
}