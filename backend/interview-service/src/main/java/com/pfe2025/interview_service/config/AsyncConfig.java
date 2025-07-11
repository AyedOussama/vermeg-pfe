package com.pfe2025.interview_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration for asynchronous operations.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Executor for event processing tasks.
     */
    @Bean(name = "eventTaskExecutor")
    public Executor eventTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(10);
        executor.setThreadNamePrefix("EventTask-");
        executor.initialize();
        return executor;
    }

    /**
     * Executor for calendar integration tasks.
     */
    @Bean(name = "calendarTaskExecutor")
    public Executor calendarTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(20);
        executor.setThreadNamePrefix("CalendarTask-");
        executor.initialize();
        return executor;
    }

    /**
     * Executor for notification tasks.
     */
    @Bean(name = "notificationTaskExecutor")
    public Executor notificationTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(3);
        executor.setQueueCapacity(15);
        executor.setThreadNamePrefix("NotificationTask-");
        executor.initialize();
        return executor;
    }
}