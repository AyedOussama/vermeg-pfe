package com.pfe2025.document_management_service.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration des métriques personnalisées pour le monitoring
 */
@Configuration
public class MetricsConfig {

    @Bean
    public Counter uploadSuccessCounter(MeterRegistry meterRegistry) {
        return Counter.builder("document.upload.success")
                .description("Number of successful document uploads")
                .tag("service", "document-management")
                .register(meterRegistry);
    }

    @Bean
    public Counter uploadFailureCounter(MeterRegistry meterRegistry) {
        return Counter.builder("document.upload.failure")
                .description("Number of failed document uploads")
                .tag("service", "document-management")
                .register(meterRegistry);
    }

    @Bean
    public Counter securityViolationCounter(MeterRegistry meterRegistry) {
        return Counter.builder("document.security.violation")
                .description("Number of security violations detected")
                .tag("service", "document-management")
                .register(meterRegistry);
    }

    @Bean
    public Timer uploadTimer(MeterRegistry meterRegistry) {
        return Timer.builder("document.upload.duration")
                .description("Time taken to upload documents")
                .tag("service", "document-management")
                .register(meterRegistry);
    }

    @Bean
    public Counter rabbitMqPublishCounter(MeterRegistry meterRegistry) {
        return Counter.builder("document.rabbitmq.publish")
                .description("Number of RabbitMQ messages published")
                .tag("service", "document-management")
                .register(meterRegistry);
    }
}
