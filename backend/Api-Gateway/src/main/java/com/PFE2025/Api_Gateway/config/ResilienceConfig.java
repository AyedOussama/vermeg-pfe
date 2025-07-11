package com.PFE2025.Api_Gateway.config;



import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import org.springframework.cloud.circuitbreaker.resilience4j.ReactiveResilience4JCircuitBreakerFactory;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JConfigBuilder;
import org.springframework.cloud.client.circuitbreaker.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class ResilienceConfig {

    /**
     * Configuration par défaut pour tous les circuit breakers
     */
    @Bean
    public Customizer<ReactiveResilience4JCircuitBreakerFactory> defaultCustomizer() {
        return factory -> factory.configureDefault(id -> {
            CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
                    .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                    .slidingWindowSize(10)
                    .failureRateThreshold(50)
                    .waitDurationInOpenState(Duration.ofSeconds(10))
                    .permittedNumberOfCallsInHalfOpenState(3)
                    .automaticTransitionFromOpenToHalfOpenEnabled(true)
                    .build();

            TimeLimiterConfig timeLimiterConfig = TimeLimiterConfig.custom()
                    .timeoutDuration(Duration.ofSeconds(3))
                    .build();

            return new Resilience4JConfigBuilder(id)
                    .circuitBreakerConfig(circuitBreakerConfig)
                    .timeLimiterConfig(timeLimiterConfig)
                    .build();
        });
    }

    /**
     * Configuration spécifique pour auth-service (plus tolérante)
     */
    @Bean
    public Customizer<ReactiveResilience4JCircuitBreakerFactory> authServiceCustomizer() {
        return factory -> factory.configure(builder -> {
            CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
                    .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                    .slidingWindowSize(20) // Plus de tentatives
                    .failureRateThreshold(60) // Plus tolérant
                    .waitDurationInOpenState(Duration.ofSeconds(5)) // Récupération plus rapide
                    .permittedNumberOfCallsInHalfOpenState(5)
                    .automaticTransitionFromOpenToHalfOpenEnabled(true)
                    .build();

            TimeLimiterConfig timeLimiterConfig = TimeLimiterConfig.custom()
                    .timeoutDuration(Duration.ofSeconds(5)) // Plus de temps pour auth
                    .build();

            builder.circuitBreakerConfig(circuitBreakerConfig)
                    .timeLimiterConfig(timeLimiterConfig);
        }, "auth-service");
    }

    /**
     * Configuration pour les services moins critiques
     */
    @Bean
    public Customizer<ReactiveResilience4JCircuitBreakerFactory> nonCriticalServiceCustomizer() {
        return factory -> {
            CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
                    .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.TIME_BASED)
                    .slidingWindowSize(30) // 30 secondes
                    .failureRateThreshold(40) // Plus strict
                    .waitDurationInOpenState(Duration.ofSeconds(15)) // Plus long
                    .permittedNumberOfCallsInHalfOpenState(2)
                    .automaticTransitionFromOpenToHalfOpenEnabled(true)
                    .build();

            TimeLimiterConfig timeLimiterConfig = TimeLimiterConfig.custom()
                    .timeoutDuration(Duration.ofSeconds(2))
                    .build();

            // Appliquer à plusieurs services
            String[] services = {"document-management-service", "job-posting-service"};
            for (String service : services) {
                factory.configure(builder -> builder
                        .circuitBreakerConfig(circuitBreakerConfig)
                        .timeLimiterConfig(timeLimiterConfig), service);
            }
        };
    }
}
