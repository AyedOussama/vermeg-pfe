package com.PFE2025.Api_Gateway.filter;


// Imports supprimés - plus besoin avec la propagation JWT simple
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@Slf4j
public class AuthenticationFilter implements GlobalFilter, Ordered {

    // Services supprimés - plus besoin avec la propagation JWT simple
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Value("#{'${public-endpoints.paths}'.split(',')}")
    private List<String> publicPaths;

    @Value("${auth.cookie.access-token-name}")
    private String accessTokenCookieName;

    // Variables admin supprimées - plus besoin avec la propagation JWT simple

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        String method = request.getMethod().name();

        log.debug("AuthenticationFilter processing: {} {}", method, path);

        // 1. Vérifier si c'est un endpoint public - BYPASS COMPLET
        if (isPublicPath(path)) {
            log.info("Public path accessed - bypassing ALL authentication: {} {}", method, path);
            // Pour les endpoints publics, on passe directement sans aucune validation
            return chain.filter(exchange);
        }

        // 2. Extraire le token (Cookie ou Bearer)
        String token = extractToken(request);
        if (token == null) {
            log.debug("No token found for path: {}", path);
            return handleUnauthorized(exchange, "Missing authentication token");
        }

        // 3. Simplement propager le JWT - laisser chaque microservice le valider
        String requestId = generateRequestId();

        ServerHttpRequest modifiedRequest = request.mutate()
                .header("Authorization", "Bearer " + token)
                .header("X-Request-Id", requestId)
                .build();

        ServerWebExchange modifiedExchange = exchange.mutate()
                .request(modifiedRequest)
                .build();

        log.debug("JWT token propagated for path: {} with ID: {}", path, requestId);
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

    private String generateRequestId() {
        return java.util.UUID.randomUUID().toString().substring(0, 8);
    }

    private boolean isPublicPath(String path) {
        log.debug("Checking if path '{}' is public. Public paths: {}", path, publicPaths);
        boolean isPublic = publicPaths.stream()
                .anyMatch(pattern -> {
                    boolean matches = pathMatcher.match(pattern.trim(), path);
                    log.debug("Pattern '{}' matches path '{}': {}", pattern.trim(), path, matches);
                    return matches;
                });
        log.debug("Path '{}' is public: {}", path, isPublic);
        return isPublic;
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");

        String body = String.format("""
                {
                    "status": 401,
                    "error": "Unauthorized",
                    "message": "%s",
                    "timestamp": %d
                }
                """, message, System.currentTimeMillis());

        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }



    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 2; // Après logging et rate limiting
    }
}
