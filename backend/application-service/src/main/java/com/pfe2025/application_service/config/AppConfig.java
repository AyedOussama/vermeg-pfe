package com.pfe2025.application_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@EnableScheduling
public class AppConfig {

    @Bean
    @ConfigurationProperties(prefix = "app")
    public ApplicationProperties applicationProperties() {
        return new ApplicationProperties();
    }

    @Bean("aiTaskExecutor")
    public Executor aiTaskExecutor(ApplicationProperties applicationProperties) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("ai-task-");
        executor.initialize();
        return executor;
    }

    @Bean("integrationTaskExecutor")
    public Executor integrationTaskExecutor(ApplicationProperties applicationProperties) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("integration-");
        executor.initialize();
        return executor;
    }

    @Bean("reportTaskExecutor")
    public Executor reportTaskExecutor(ApplicationProperties applicationProperties) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("report-task-");
        executor.initialize();
        return executor;
    }
}