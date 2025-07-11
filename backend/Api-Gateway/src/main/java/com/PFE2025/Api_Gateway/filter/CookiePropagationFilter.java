package com.PFE2025.Api_Gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Filtre spécifique pour propager les cookies Set-Cookie depuis auth-service
 * Important pour les endpoints de login/refresh
 */
@Component
@Slf4j
public class CookiePropagationFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        // Seulement pour les endpoints d'authentification
        if (path.startsWith("/api/auth/")) {
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                ServerHttpResponse response = exchange.getResponse();
                HttpHeaders headers = response.getHeaders();

                // Vérifier et logger les cookies qui sont définis
                List<String> setCookieHeaders = headers.get(HttpHeaders.SET_COOKIE);
                if (setCookieHeaders != null && !setCookieHeaders.isEmpty()) {
                    log.debug("Propagating {} Set-Cookie headers from auth-service for path: {}",
                            setCookieHeaders.size(), path);

                    // Les cookies sont automatiquement propagés par Spring Cloud Gateway
                    // Ce filtre sert principalement au monitoring et debugging

                    if (log.isTraceEnabled()) {
                        setCookieHeaders.forEach(cookie ->
                                log.trace("Set-Cookie: {}", cookie.substring(0, Math.min(cookie.length(), 50)) + "..."));
                    }
                }
            }));
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        // S'exécuter en dernier pour voir la réponse finale
        return Ordered.LOWEST_PRECEDENCE;
    }
}