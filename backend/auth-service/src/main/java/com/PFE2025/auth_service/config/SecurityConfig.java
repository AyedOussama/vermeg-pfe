package com.PFE2025.auth_service.config;

import com.PFE2025.auth_service.security.KeycloakRoleConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoders;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration de sécurité pour l'auth-service
 */
@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                // Désactiver CSRF car on utilise JWT
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                // Configuration CORS
                //               .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .cors(ServerHttpSecurity.CorsSpec::disable)

                // Désactiver le cache des requêtes
                .requestCache(ServerHttpSecurity.RequestCacheSpec::disable)

                .authorizeExchange(auth -> auth
                        // Endpoints publics pour la documentation API
                        .pathMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml",
                                "/swagger-resources/**",
                                "/swagger-resources",
                                "/configuration/**",
                                "/webjars/**"
                        ).permitAll()

                        // Endpoints d'authentification (non sécurisés)
                        .pathMatchers("/auth/login", "/auth/refresh", "/auth/validate", "/auth/logout").permitAll()
                        .pathMatchers("/auth/forgot-password/**").permitAll()
                        .pathMatchers("/auth/health").permitAll()

                        // Endpoints de monitoring
                        .pathMatchers("/actuator/**").permitAll()

                        // Options pour CORS
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()

                        // --- Gestion des utilisateurs ---
                        // Création d'utilisateur
                        .pathMatchers(HttpMethod.POST, "/auth/users")
                        .hasAnyRole("CEO", "RH_ADMIN","INTERNAL_SERVICE")

                        // Consultation d'utilisateur
                        .pathMatchers(HttpMethod.GET, "/auth/users/**")
                        .hasAnyRole("CEO", "RH_ADMIN", "INTERNAL_SERVICE")

                        // Mise à jour d'utilisateur
                        .pathMatchers(HttpMethod.PUT, "/auth/users/{id}")
                        .hasAnyRole("CEO", "RH_ADMIN","INTERNAL_SERVICE")

                        // Suppression d'utilisateur
                        .pathMatchers(HttpMethod.DELETE, "/auth/users/{id}")
                        .hasRole("CEO")

                        // Changement de statut
                        .pathMatchers(HttpMethod.PATCH, "/auth/users/{id}/status")
                        .hasAnyRole("CEO", "RH_ADMIN")

                        // Gestion des rôles
                        .pathMatchers(HttpMethod.PUT, "/auth/users/{id}/roles")
                        .hasRole("CEO")

                        // Reset password par admin
                        .pathMatchers(HttpMethod.POST, "/auth/users/{id}/reset-password")
                        .hasAnyRole("CEO")

                        // Bulk operations
                        .pathMatchers(HttpMethod.POST, "/auth/users/details-bulk")
                        .hasAnyRole("CEO", "RH_ADMIN", "INTERNAL_SERVICE")

                        // Endpoints authentifiés
                        .pathMatchers("/auth/me", "/auth/change-password").authenticated()

                        // Endpoints de debug (nécessitent CEO)
                        .pathMatchers("/auth/debug/**").hasRole("CEO")

                        // Tout le reste nécessite une authentification
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint((exchange, ex) -> {
                            log.warn("Échec d'authentification: {}", ex.getMessage());
                            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
                            String errorJson = "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Accès non autorisé\",\"timestamp\":" +
                                    System.currentTimeMillis() + "}";
                            return exchange.getResponse().writeWith(
                                    Mono.just(exchange.getResponse().bufferFactory().wrap(errorJson.getBytes()))
                            );
                        })
                        .accessDeniedHandler((exchange, denied) -> {
                            log.warn("Accès refusé: {}", denied.getMessage());
                            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
                            String errorJson = "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Accès refusé - Rôles insuffisants\",\"timestamp\":" +
                                    System.currentTimeMillis() + "}";
                            return exchange.getResponse().writeWith(
                                    Mono.just(exchange.getResponse().bufferFactory().wrap(errorJson.getBytes()))
                            );
                        })
                )
                .build();
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        return ReactiveJwtDecoders.fromIssuerLocation(issuerUri);
    }

    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
        return new ReactiveJwtAuthenticationConverterAdapter(jwtConverter);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // IMPORTANT: Ajouter l'URL exacte du frontend sans slash final
        config.setAllowedOrigins(Arrays.asList("http://localhost:3000"));

        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setExposedHeaders(Arrays.asList("Set-Cookie"));

        // CRUCIAL pour les cookies
        config.setAllowCredentials(true);

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}