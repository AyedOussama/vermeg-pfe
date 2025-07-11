package com.PFE2025.auth_service.config;

import com.PFE2025.auth_service.security.LoggingExchangeFilterFunction;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Configuration du WebClient utilisé pour les appels HTTP réactifs
 */
@Configuration
@Slf4j
@RequiredArgsConstructor
public class WebClientConfig {

    private final KeycloakConfig keycloakConfig;
    private final LoggingExchangeFilterFunction loggingFilter;

    /**
     * Configuration du WebClient avec des paramètres optimisés pour les performances et la résilience
     */
    @Bean
    public WebClient.Builder webClientBuilder() {
        // Créer un fournisseur de connexion avec paramètres adaptés
        ConnectionProvider provider = ConnectionProvider.builder("keycloak-connection-pool")
                .maxConnections(50)
                .maxIdleTime(Duration.ofSeconds(60))
                .maxLifeTime(Duration.ofMinutes(5))
                .pendingAcquireTimeout(Duration.ofSeconds(5))
                .evictInBackground(Duration.ofSeconds(120))
                .build();

        // Configurer le client HTTP avec les timeouts appropriés
        HttpClient httpClient = HttpClient.create(provider)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, keycloakConfig.getClientTimeouts().getConnection())
                .responseTimeout(Duration.ofMillis(keycloakConfig.getClientTimeouts().getRead()))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(keycloakConfig.getClientTimeouts().getRead(), TimeUnit.MILLISECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(keycloakConfig.getClientTimeouts().getRead(), TimeUnit.MILLISECONDS)));

        // Augmenter la taille maximale du buffer pour les réponses
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(codecs -> codecs.defaultCodecs().maxInMemorySize(2 * 1024 * 1024)) // 2MB
                .build();

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .exchangeStrategies(strategies)
                .filter(loggingFilter);
    }
}