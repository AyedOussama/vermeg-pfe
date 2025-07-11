package com.PFE2025.user_service.config;

import com.PFE2025.user_service.dto.response.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import java.io.IOException;
import java.time.LocalDateTime;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final ObjectMapper objectMapper;
    private final KeycloakRoleConverter keycloakJwtConverter;

    // Utilisez des valeurs par défaut directement
    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:http://localhost:9090/realms/vermeg-Platform}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:http://localhost:9090/realms/vermeg-Platform/protocol/openid-connect/certs}")
    private String jwkSetUri;

    @Bean
    public JwtDecoder jwtDecoder() {
        log.info("Configuring JwtDecoder with issuer-uri: {}", issuerUri);
        return JwtDecoders.fromIssuerLocation(issuerUri);
    }

    private static final String[] SWAGGER_PATHS = {
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    };

    private static final String[] ACTUATOR_PUBLIC_PATHS = {
            "/actuator/health",
            "/actuator/info"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Paths publics
                        .requestMatchers(SWAGGER_PATHS).permitAll()
                        .requestMatchers(ACTUATOR_PUBLIC_PATHS).permitAll()
                        
                        .requestMatchers("/users/register").permitAll() // Path direct (pour les tests)
                        .requestMatchers("/api/test/**").permitAll() // Pour les tests

                        // Actuator sécurisés
                        .requestMatchers("/actuator/**").hasRole("CEO")
                        .requestMatchers(HttpMethod.GET, "/api/profile/me").authenticated() // Path via API Gateway
                        .requestMatchers(HttpMethod.GET, "/profile/me").authenticated() // Path direct
                        .requestMatchers("/api/users/forgot-password").permitAll() // Path via API Gateway
                        .requestMatchers("/users/forgot-password").permitAll() // Path direct
                        .requestMatchers("/api/users/verify-email-forgot-password").permitAll() // Path via API Gateway
                        .requestMatchers("/users/verify-email-forgot-password").permitAll() // Path direct

                        // Endpoints admin protégés
                        .requestMatchers("/api/users/admin/**").hasAnyRole("CEO", "RH_ADMIN", "INTERNAL_SERVICE") // Path via API Gateway
                        .requestMatchers("/users/admin/**").hasAnyRole("CEO", "RH_ADMIN", "INTERNAL_SERVICE") // Path direct

                        // Endpoint de changement de mot de passe
                        .requestMatchers("/api/users/password").authenticated() // Path via API Gateway
                        .requestMatchers("/users/password").authenticated() // Path direct

                        // Tout le reste nécessite une authentification
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtConverter))
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler())
                );

        return http.build();
    }



    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) -> {
            log.warn("Échec d'authentification pour la requête {}: {}",
                    request.getRequestURI(), authException.getMessage());

            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());

            ApiError apiError = ApiError.builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .message("Authentification requise: " + authException.getMessage())
                    .path(request.getRequestURI())
                    .timestamp(LocalDateTime.now())
                    .build();

            try {
                response.getWriter().write(objectMapper.writeValueAsString(apiError));
            } catch (IOException e) {
                log.error("Erreur lors de l'écriture de la réponse d'erreur 401", e);
            }
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) -> {
            log.warn("Accès refusé pour la requête {}: {}",
                    request.getRequestURI(), accessDeniedException.getMessage());

            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpStatus.FORBIDDEN.value());

            ApiError apiError = ApiError.builder()
                    .status(HttpStatus.FORBIDDEN.value())
                    .message("Accès refusé: Vous n'avez pas les permissions nécessaires pour cette ressource")
                    .path(request.getRequestURI())
                    .timestamp(LocalDateTime.now())
                    .build();

            try {
                response.getWriter().write(objectMapper.writeValueAsString(apiError));
            } catch (IOException e) {
                log.error("Erreur lors de l'écriture de la réponse d'erreur 403", e);
            }
        };
    }
}