package com.PFE2025.auth_service.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Filtre pour journaliser les requêtes et réponses WebClient
 * Utile pour le débogage et le suivi des requêtes
 */
@Component
@Slf4j
public class LoggingExchangeFilterFunction implements ExchangeFilterFunction {

    private final AtomicLong requestCounter = new AtomicLong(0);

    @Override
    public Mono<ClientResponse> filter(ClientRequest request, ExchangeFunction next) {
        final long requestId = requestCounter.incrementAndGet();
        final URI uri = request.url();
        final String method = request.method().name();
        final String requestDescription = String.format("[Request %d] %s %s", requestId, method, uri);

        log.debug("{} - Début", requestDescription);

        long startTime = System.currentTimeMillis();

        return next.exchange(request)
                .doOnSuccess(response -> {
                    long duration = System.currentTimeMillis() - startTime;
                    log.debug("{} - Terminé avec statut: {} en {}ms",
                            requestDescription, response.statusCode(), duration);
                })
                .doOnError(error -> {
                    long duration = System.currentTimeMillis() - startTime;
                    log.error("{} - Échec après {}ms: {}",
                            requestDescription, duration, error.getMessage(), error);
                });
    }

    /**
     * Filtre les détails sensibles comme les jetons dans les URLs de requête
     * @param uri L'URI à masquer
     * @return L'URI avec les informations sensibles masquées
     */
    private String maskSensitiveInfo(URI uri) {
        String query = uri.getQuery();
        if (query == null) {
            return uri.toString();
        }

        // Masquer les jetons et autres données sensibles
        String maskedQuery = query
                .replaceAll("(token|password|secret|key)=[^&]*", "$1=***")
                .replaceAll("(client_secret)=[^&]*", "$1=***")
                .replaceAll("(access_token|refresh_token|id_token)=[^&]*", "$1=***");

        return uri.toString().replace(query, maskedQuery);
    }
}
