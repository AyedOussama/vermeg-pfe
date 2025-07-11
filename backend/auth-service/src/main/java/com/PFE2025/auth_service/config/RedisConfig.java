package com.PFE2025.auth_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.PFE2025.auth_service.dto.TokenValidationResult;
import com.PFE2025.auth_service.dto.UserDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Configuration de Redis pour le stockage réactif en cache
 */
@Configuration
@Slf4j
public class RedisConfig {

    @Value("${spring.data.redis.ttl.tokens:900}")
    private long tokenTtlSeconds;

    @Value("${spring.data.redis.ttl.users:3600}")
    private long userTtlSeconds;

    @Value("${spring.data.redis.key-prefix:auth-service:}")
    private String keyPrefix;

    /**
     * ObjectMapper personnalisé avec support pour les types Java 8+
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.findAndRegisterModules();
        return mapper;
    }

    /**
     * Template Redis générique pour tous les types d'objets
     * Simplifié pour éviter la multiplication des templates
     */
    @Bean
    public ReactiveRedisTemplate<String, Object> reactiveRedisTemplate(
            ReactiveRedisConnectionFactory factory, ObjectMapper objectMapper) {

        Jackson2JsonRedisSerializer<Object> serializer =
                new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);

        RedisSerializationContext<String, Object> context =
                RedisSerializationContext.<String, Object>newSerializationContext(new StringRedisSerializer())
                        .value(serializer)
                        .build();

        return new ReactiveRedisTemplate<>(factory, context);
    }

    /**
     * Template Redis spécifique pour TokenValidationResult
     * Nécessaire pour éviter les problèmes de désérialisation
     */
    @Bean
    public ReactiveRedisTemplate<String, TokenValidationResult> tokenValidationRedisTemplate(
            ReactiveRedisConnectionFactory factory, ObjectMapper objectMapper) {

        Jackson2JsonRedisSerializer<TokenValidationResult> serializer =
                new Jackson2JsonRedisSerializer<>(objectMapper, TokenValidationResult.class);

        RedisSerializationContext<String, TokenValidationResult> context =
                RedisSerializationContext.<String, TokenValidationResult>newSerializationContext(new StringRedisSerializer())
                        .value(serializer)
                        .build();

        return new ReactiveRedisTemplate<>(factory, context);
    }

    /**
     * Indicateur de santé pour surveiller Redis
     */
    @Bean
    public HealthIndicator redisHealthIndicator(ReactiveRedisConnectionFactory factory) {
        return () -> {
            try {
                return factory.getReactiveConnection().ping()
                        .map(pong -> Health.up()
                                .withDetail("status", "connected")
                                .withDetail("response", pong)
                                .build())
                        .defaultIfEmpty(Health.down()
                                .withDetail("error", "Pas de réponse de Redis")
                                .build())
                        .onErrorResume(e -> {
                            log.error("Erreur lors de la vérification de santé Redis", e);
                            return Mono.just(Health.down(e).build());
                        })
                        .block(Duration.ofSeconds(5));
            } catch (Exception e) {
                log.error("Erreur critique lors de la vérification de santé Redis", e);
                return Health.down(e).build();
            }
        };
    }
}
