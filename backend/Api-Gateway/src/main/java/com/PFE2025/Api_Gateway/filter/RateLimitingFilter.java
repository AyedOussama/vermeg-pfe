package com.PFE2025.Api_Gateway.filter;

import com.PFE2025.Api_Gateway.config.RateLimitConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

import java.time.Duration;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitingFilter implements GlobalFilter, Ordered {

    private final ReactiveRedisTemplate<String, Object> redisTemplate;
    private final RateLimitConfig rateLimitConfig;

    @Value("${public-endpoints.paths}")
    private String publicEndpointsString;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private static final String RATE_LIMIT_PREFIX = "rate_limit:";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!rateLimitConfig.isEnabled()) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getPath().value();

        // Vérifier si c'est un endpoint public - BYPASS rate limiting
        if (isPublicPath(path)) {
            log.debug("Public path - bypassing rate limiting: {}", path);
            return chain.filter(exchange);
        }

        String clientIp = getClientIp(exchange);

        // Obtenir la configuration de rate limit pour ce path
        RateLimitConfig.EndpointConfig endpointConfig = rateLimitConfig.getConfigForPath(path);

        String key = RATE_LIMIT_PREFIX + clientIp + ":" + getPathKey(path);

        return redisTemplate.opsForValue()
                .increment(key)
                .flatMap(count -> {
                    if (count == 1) {
                        // Première requête, définir l'expiration
                        return redisTemplate.expire(key, Duration.ofSeconds(endpointConfig.getDuration()))
                                .then(processRequest(exchange, chain, count, endpointConfig));
                    }
                    return processRequest(exchange, chain, count, endpointConfig);
                })
                .onErrorResume(error -> {
                    log.error("Rate limiting error: {}", error.getMessage());
                    // En cas d'erreur Redis, permettre la requête
                    return chain.filter(exchange);
                });
    }

    private Mono<Void> processRequest(ServerWebExchange exchange, GatewayFilterChain chain,
                                      Long count, RateLimitConfig.EndpointConfig config) {
        if (count > config.getLimit()) {
            log.warn("Rate limit exceeded for IP: {} on path: {}",
                    getClientIp(exchange), exchange.getRequest().getPath());

            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().add("X-RateLimit-Limit",
                    String.valueOf(config.getLimit()));
            exchange.getResponse().getHeaders().add("X-RateLimit-Remaining", "0");
            exchange.getResponse().getHeaders().add("X-RateLimit-Reset",
                    String.valueOf(System.currentTimeMillis() + (config.getDuration() * 1000)));

            String body = """
                    {
                        "status": 429,
                        "error": "Too Many Requests",
                        "message": "Rate limit exceeded. Please try again later.",
                        "timestamp": %d
                    }
                    """.formatted(System.currentTimeMillis());

            return exchange.getResponse()
                    .writeWith(Mono.just(exchange.getResponse()
                            .bufferFactory()
                            .wrap(body.getBytes())));
        }

        // Ajouter les headers de rate limit
        exchange.getResponse().getHeaders().add("X-RateLimit-Limit",
                String.valueOf(config.getLimit()));
        exchange.getResponse().getHeaders().add("X-RateLimit-Remaining",
                String.valueOf(Math.max(0, config.getLimit() - count)));

        return chain.filter(exchange);
    }

    private String getClientIp(ServerWebExchange exchange) {
        String xForwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = exchange.getRequest().getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return exchange.getRequest().getRemoteAddress() != null ?
                exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() :
                "unknown";
    }

    private String getPathKey(String path) {
        // Simplifier le path pour le regroupement
        String[] segments = path.split("/");
        if (segments.length >= 3) {
            return "/" + segments[1] + "/" + segments[2];
        }
        return path;
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private boolean isPublicPath(String path) {
        if (publicEndpointsString == null || publicEndpointsString.trim().isEmpty()) {
            return false;
        }

        List<String> publicPaths = Arrays.asList(publicEndpointsString.split(","));
        return publicPaths.stream()
                .anyMatch(pattern -> pathMatcher.match(pattern.trim(), path));
    }
}