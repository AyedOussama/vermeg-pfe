package com.PFE2025.auth_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimiterService {

    private final ReactiveRedisTemplate<String, Object> redisTemplate;

    private static final String RATE_LIMIT_PREFIX = "rate_limit:";
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final Duration LOGIN_BLOCK_DURATION = Duration.ofMinutes(15);
    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final Duration GENERAL_WINDOW = Duration.ofMinutes(1);

    /**
     * Check rate limit for a specific key
     */
    public Mono<Boolean> checkRateLimit(String key, int maxAttempts, Duration window) {
        String rateLimitKey = RATE_LIMIT_PREFIX + key;

        return redisTemplate.opsForValue()
                .increment(rateLimitKey)
                .flatMap(attempts -> {
                    if (attempts == 1) {
                        // First attempt, set expiration
                        return redisTemplate.expire(rateLimitKey, window)
                                .thenReturn(true);
                    } else if (attempts > maxAttempts) {
                        log.warn("Rate limit exceeded for key: {}, attempts: {}", key, attempts);
                        return Mono.just(false);
                    }
                    return Mono.just(true);
                })
                .onErrorResume(e -> {
                    log.error("Rate limiter error for key {}: {}", key, e.getMessage());
                    // En cas d'erreur Redis, permettre l'accès
                    return Mono.just(true);
                });
    }

    /**
     * Check if login is allowed for email
     */
    public Mono<Boolean> isLoginAllowed(String email) {
        return checkRateLimit("login:" + email, MAX_LOGIN_ATTEMPTS, LOGIN_BLOCK_DURATION)
                .doOnNext(allowed -> {
                    if (!allowed) {
                        log.warn("Login blocked for email: {} - too many attempts", email);
                    }
                });
    }

    /**
     * Check general API rate limit for IP
     */
    public Mono<Boolean> isRequestAllowed(String ip) {
        return checkRateLimit("api:" + ip, MAX_REQUESTS_PER_MINUTE, GENERAL_WINDOW);
    }

    /**
     * Reset rate limit for a specific key
     */
    public Mono<Void> resetRateLimit(String key) {
        return redisTemplate.delete(RATE_LIMIT_PREFIX + key)
                .doOnSuccess(deleted -> {
                    if (deleted > 0) {
                        log.info("Rate limit reset for key: {}", key);
                    }
                })
                .then();
    }

    /**
     * Reset login attempts on successful login
     */
    public Mono<Void> resetLoginAttempts(String email) {
        return resetRateLimit("login:" + email);
    }

    /**
     * Get remaining attempts
     */
    public Mono<Integer> getRemainingAttempts(String key, int maxAttempts) {
        String rateLimitKey = RATE_LIMIT_PREFIX + key;

        return redisTemplate.opsForValue()
                .get(rateLimitKey)
                .cast(Integer.class)
                .map(attempts -> Math.max(0, maxAttempts - attempts))
                .defaultIfEmpty(maxAttempts);
    }

    /**
     * Get remaining login attempts for email
     */
    public Mono<Integer> getRemainingLoginAttempts(String email) {
        return getRemainingAttempts("login:" + email, MAX_LOGIN_ATTEMPTS);
    }
}