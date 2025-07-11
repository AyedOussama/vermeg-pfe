package com.PFE2025.Api_Gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Filtre simple pour propager le JWT aux microservices
 * Alternative plus simple au AuthenticationFilter complexe
 */
@Component
@Slf4j
public class JwtPropagationFilter implements GlobalFilter, Ordered {

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Value("#{'${public-endpoints.paths}'.split(',')}")
    private List<String> publicPaths;

    @Value("${auth.cookie.access-token-name}")
    private String accessTokenCookieName;

    // Désactivé par défaut pour ne pas interférer avec l'existant
    @Value("${jwt-propagation.enabled:false}")
    private boolean enabled;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!enabled) {
            return chain.filter(exchange);
        }

        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        log.debug("JwtPropagationFilter: Processing request to {}", path);

        // 1. Vérifier si c'est un endpoint public
        if (isPublicPath(path)) {
            log.debug("Public path accessed - no JWT propagation needed: {}", path);
            return chain.filter(exchange);
        }

        // 2. Extraire le token JWT
        String token = extractToken(request);
        if (token == null) {
            log.debug("No JWT token found for path: {}", path);
            return handleUnauthorized(exchange);
        }

        // 3. Propager le JWT dans le header Authorization
        ServerHttpRequest modifiedRequest = request.mutate()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();

        ServerWebExchange modifiedExchange = exchange.mutate()
                .request(modifiedRequest)
                .build();

        log.debug("JWT propagated successfully for path: {}", path);
        return chain.filter(modifiedExchange);
    }

    private String extractToken(ServerHttpRequest request) {
        // 1. Vérifier d'abord le header Authorization
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 2. Sinon, vérifier le cookie
        HttpCookie cookie = request.getCookies().getFirst(accessTokenCookieName);
        if (cookie != null) {
            return cookie.getValue();
        }

        return null;
    }

    private boolean isPublicPath(String path) {
        return publicPaths.stream()
                .anyMatch(publicPath -> pathMatcher.match(publicPath, path));
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        // S'exécuter après AuthenticationFilter pour ne pas interférer
        return Ordered.LOWEST_PRECEDENCE - 1;
    }
}
