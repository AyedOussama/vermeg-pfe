package com.PFE2025.Api_Gateway.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${keycloak.jwk-set-uri}")
    private String jwkSetUri;

    @Value("#{'${public-endpoints.paths}'.split(',')}")
    private List<String> publicPaths;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                // Désactiver CSRF
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                // IMPORTANT : Désactiver complètement CORS dans Spring Security
                // Laisser Spring Cloud Gateway gérer CORS
                .cors(ServerHttpSecurity.CorsSpec::disable)

                // DÉSACTIVER COMPLÈTEMENT Spring Security
                // Notre AuthenticationFilter personnalisé gère TOUTE l'authentification
                .authorizeExchange(exchanges -> exchanges
                        .anyExchange().permitAll()
                )

                // Désactiver OAuth2 Resource Server pour éviter les conflits
                // .oauth2ResourceServer(oauth2 -> oauth2
                //         .jwt(jwt -> jwt.jwtDecoder(jwtDecoder()))
                // )

                .build();
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        return NimbusReactiveJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }
}