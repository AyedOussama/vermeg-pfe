package com.PFE2025.auth_service.service;

import com.PFE2025.auth_service.dto.TokenValidationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TokenService {

    private final ReactiveJwtDecoder jwtDecoder;
    private final ReactiveRedisTemplate<String, TokenValidationResult> redisTemplate;

    // Constructeur avec injection du bon bean Redis
    public TokenService(ReactiveJwtDecoder jwtDecoder,
                        @Qualifier("tokenValidationRedisTemplate") ReactiveRedisTemplate<String, TokenValidationResult> redisTemplate) {
        this.jwtDecoder = jwtDecoder;
        this.redisTemplate = redisTemplate;
    }

    private static final String TOKEN_CACHE_PREFIX = "token:validation:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);

    // Rôles autorisés dans l'application
    private static final Set<String> ALLOWED_ROLES = Set.of(
            "CEO",
            "CANDIDATE",
            "PROJECT_LEADER",
            "RH_ADMIN",
            "INTERNAL_SERVICE"
    );

    /**
     * Validate JWT token with caching
     */
    public Mono<TokenValidationResult> validateToken(String token) {
        if (token == null || token.isEmpty()) {
            return Mono.just(TokenValidationResult.invalid());
        }

        // Sanitize token for cache key
        String cacheKey = TOKEN_CACHE_PREFIX + token.hashCode();

        // Check cache first
        return redisTemplate.opsForValue().get(cacheKey)
                .doOnNext(cached -> log.debug("Token validation result found in cache for key: {}", cacheKey))
                .switchIfEmpty(
                        // If not in cache, validate and cache
                        validateTokenInternal(token)
                                .flatMap(result -> {
                                    if (result.isValid() && result.getExpiresIn() != null && result.getExpiresIn() > 0) {
                                        // Only cache valid tokens that haven't expired
                                        Duration cacheDuration = Duration.ofSeconds(
                                                Math.min(result.getExpiresIn(), CACHE_TTL.getSeconds())
                                        );
                                        return redisTemplate.opsForValue()
                                                .set(cacheKey, result, cacheDuration)
                                                .doOnSuccess(v -> log.debug("Token validation cached for {} seconds with key: {}",
                                                        cacheDuration.getSeconds(), cacheKey))
                                                .doOnError(e -> log.warn("Failed to cache token validation result: {}", e.getMessage()))
                                                .thenReturn(result)
                                                .onErrorReturn(result); // Si le cache échoue, on retourne quand même le résultat
                                    }
                                    return Mono.just(result);
                                })
                )
                .onErrorResume(e -> {
                    log.error("Error validating token from cache, falling back to direct validation: {}", e.getMessage());
                    // Si le cache échoue, on fait une validation directe
                    return validateTokenInternal(token);
                });
    }

    private Mono<TokenValidationResult> validateTokenInternal(String token) {
        return jwtDecoder.decode(token)
                .map(this::buildValidationResult)
                .doOnSuccess(result -> log.debug("Token validated successfully for user: {}", result.getUserId()))
                .onErrorResume(JwtException.class, e -> {
                    log.debug("Token validation failed: {}", e.getMessage());
                    return Mono.just(TokenValidationResult.invalid());
                })
                .onErrorResume(e -> {
                    log.error("Unexpected error during token validation: {}", e.getMessage());
                    return Mono.just(TokenValidationResult.invalid());
                });
    }

    @SuppressWarnings("unchecked")
    private TokenValidationResult buildValidationResult(Jwt jwt) {
        Map<String, Object> claims = jwt.getClaims();
        List<String> roles = new ArrayList<>();

        // Extract roles from realm_access
        Map<String, Object> realmAccess = (Map<String, Object>) claims.get("realm_access");
        if (realmAccess != null && realmAccess.get("roles") instanceof List) {
            List<String> realmRoles = (List<String>) realmAccess.get("roles");
            log.debug("Rôles realm extraits: {}", realmRoles);

            // Filtrer seulement les rôles autorisés
            List<String> filteredRealmRoles = realmRoles.stream()
                    .filter(ALLOWED_ROLES::contains)
                    .collect(Collectors.toList());

            roles.addAll(filteredRealmRoles);
            log.debug("Rôles realm filtrés: {}", filteredRealmRoles);
        }

        // Extract roles from resource_access
        Map<String, Object> resourceAccess = (Map<String, Object>) claims.get("resource_access");
        if (resourceAccess != null) {
            resourceAccess.forEach((client, clientAccess) -> {
                if (clientAccess instanceof Map) {
                    Map<String, Object> clientAccessMap = (Map<String, Object>) clientAccess;
                    if (clientAccessMap.get("roles") instanceof List) {
                        List<String> clientRoles = (List<String>) clientAccessMap.get("roles");
                        log.debug("Rôles ressource '{}' extraits: {}", client, clientRoles);

                        // Filtrer seulement les rôles autorisés
                        List<String> filteredClientRoles = clientRoles.stream()
                                .filter(ALLOWED_ROLES::contains)
                                .collect(Collectors.toList());

                        roles.addAll(filteredClientRoles);
                        log.debug("Rôles ressource '{}' filtrés: {}", client, filteredClientRoles);
                    }
                }
            });
        }

        // Calculate expiration
        Instant expiresAt = jwt.getExpiresAt();
        Long expiresIn = null;
        if (expiresAt != null) {
            expiresIn = Math.max(0, expiresAt.getEpochSecond() - Instant.now().getEpochSecond());
            if (expiresIn <= 0) {
                log.debug("Token has expired");
                return TokenValidationResult.invalid();
            }
        }

        // Extract names
        String firstName = (String) claims.get("given_name");
        String lastName = (String) claims.get("family_name");
        String fullName = (String) claims.get("name");

        // If fullName is not in claims, construct it with proper spacing
        if (fullName == null || fullName.isEmpty()) {
            StringBuilder fullNameBuilder = new StringBuilder();
            if (firstName != null && !firstName.trim().isEmpty()) {
                fullNameBuilder.append(firstName.trim());
            }
            if (lastName != null && !lastName.trim().isEmpty()) {
                if (fullNameBuilder.length() > 0) {
                    fullNameBuilder.append(" ");
                }
                fullNameBuilder.append(lastName.trim());
            }
            fullName = fullNameBuilder.toString();
        }

        String email = (String) claims.get("email");
        String username = (String) claims.getOrDefault("preferred_username", email);

        return TokenValidationResult.builder()
                .valid(true)
                .userId(jwt.getSubject())
                .username(username)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .fullName(fullName)
                .roles(roles)
                .expiresIn(expiresIn)
                .build();
    }

    /**
     * Invalidate token cache
     */
    public Mono<Void> invalidateTokenCache(String token) {
        if (token == null || token.isEmpty()) {
            return Mono.empty();
        }

        String cacheKey = TOKEN_CACHE_PREFIX + token.hashCode();
        return redisTemplate.delete(cacheKey)
                .doOnSuccess(deleted -> {
                    if (deleted > 0) {
                        log.debug("Token cache invalidated for key: {}", cacheKey);
                    } else {
                        log.debug("No cache entry found to invalidate for key: {}", cacheKey);
                    }
                })
                .doOnError(e -> log.warn("Failed to invalidate token cache: {}", e.getMessage()))
                .onErrorReturn(0L) // En cas d'erreur, on continue sans faire échouer l'opération
                .then();
    }

    /**
     * Clear all token validation cache entries
     * Utile pour le debugging ou en cas de problème de cache
     */
    public Mono<Void> clearAllTokenCache() {
        return redisTemplate.keys(TOKEN_CACHE_PREFIX + "*")
                .flatMap(redisTemplate::delete)
                .doOnNext(deleted -> log.debug("Deleted {} cache entries", deleted))
                .then()
                .doOnSuccess(v -> log.info("All token validation cache cleared"))
                .doOnError(e -> log.error("Failed to clear token cache: {}", e.getMessage()))
                .onErrorReturn(null);
    }
}