package com.pfe2025.jobpostingservice.config;

import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

/**
 * Configuration du cache Redis utilisé pour optimiser les performances de lecture.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    private static final String JOB_POSTS_CACHE = "jobPosts";
    private static final String TEMPLATES_CACHE = "templates";
    private static final String METRICS_CACHE = "metrics";
    private static final String PUBLISHED_JOB_POSTS_CACHE = "publishedJobPosts";

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer(
            GenericJackson2JsonRedisSerializer serializer,
            RedisCacheConfiguration baseConfiguration) {

        return builder -> builder
                .withCacheConfiguration(JOB_POSTS_CACHE,
                        baseConfiguration.entryTtl(Duration.ofMinutes(30)))
                .withCacheConfiguration(PUBLISHED_JOB_POSTS_CACHE,
                        baseConfiguration.entryTtl(Duration.ofMinutes(15)))
                .withCacheConfiguration(TEMPLATES_CACHE,
                        baseConfiguration.entryTtl(Duration.ofHours(6)))
                .withCacheConfiguration(METRICS_CACHE,
                        baseConfiguration.entryTtl(Duration.ofMinutes(10)));
    }
}