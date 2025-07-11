package com.PFE2025.auth_service.health;

import com.PFE2025.auth_service.config.KeycloakConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.ReactiveHealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component("keycloak")
@RequiredArgsConstructor
@Slf4j
public class KeycloakHealthIndicator implements ReactiveHealthIndicator {

    private final WebClient.Builder webClientBuilder;
    private final KeycloakConfig keycloakConfig;

    @Override
    public Mono<Health> health() {
        String healthUrl = keycloakConfig.getAuthServerUrl() + "/health";

        return webClientBuilder.build()
                .get()
                .uri(healthUrl)
                .retrieve()
                .toBodilessEntity()
                .timeout(Duration.ofSeconds(5))
                .map(response -> {
                    log.debug("Keycloak health check successful");
                    return Health.up()
                            .withDetail("url", keycloakConfig.getAuthServerUrl())
                            .withDetail("realm", keycloakConfig.getRealm())
                            .withDetail("status", "reachable")
                            .build();
                })
                .onErrorResume(ex -> {
                    log.error("Keycloak health check failed: {}", ex.getMessage());
                    return Mono.just(Health.down()
                            .withDetail("url", keycloakConfig.getAuthServerUrl())
                            .withDetail("error", ex.getMessage())
                            .withDetail("status", "unreachable")
                            .build());
                });
    }
}