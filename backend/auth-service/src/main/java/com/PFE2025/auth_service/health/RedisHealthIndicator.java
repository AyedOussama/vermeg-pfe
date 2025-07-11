package com.PFE2025.auth_service.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.ReactiveHealthIndicator;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.UUID;

@Component("redis")
@RequiredArgsConstructor
@Slf4j
public class RedisHealthIndicator implements ReactiveHealthIndicator {

    private final ReactiveRedisTemplate<String, Object> redisTemplate;

    @Override
    public Mono<Health> health() {
        String testKey = "health:check:" + UUID.randomUUID();
        String testValue = "OK";

        return redisTemplate.opsForValue()
                .set(testKey, testValue, Duration.ofSeconds(1))
                .then(redisTemplate.opsForValue().get(testKey))
                .timeout(Duration.ofSeconds(3))
                .flatMap(value -> {
                    if (testValue.equals(value)) {
                        log.debug("Redis health check successful");
                        return redisTemplate.delete(testKey)
                                .then(Mono.just(Health.up()
                                        .withDetail("status", "connected")
                                        .withDetail("test", "read-write successful")
                                        .build()));
                    } else {
                        return Mono.just(Health.down()
                                .withDetail("status", "connected but test failed")
                                .withDetail("expected", testValue)
                                .withDetail("actual", value)
                                .build());
                    }
                })
                .onErrorResume(ex -> {
                    log.error("Redis health check failed: {}", ex.getMessage());
                    return Mono.just(Health.down()
                            .withDetail("status", "disconnected")
                            .withDetail("error", ex.getMessage())
                            .build());
                });
    }
}