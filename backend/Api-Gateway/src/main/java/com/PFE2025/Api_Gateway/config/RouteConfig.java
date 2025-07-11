package com.PFE2025.Api_Gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // ============== AUTH SERVICE ==============
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("auth-service")
                                        .setFallbackUri("forward:/fallback/auth"))
                                .retry(3))
                        .uri("lb://auth-service"))

                // ============== USER SERVICE ==============
                // Route principale pour les endpoints utilisateurs
                .route("user-service-main", r -> r
                        .path("/api/users/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("user-service")
                                        .setFallbackUri("forward:/fallback/user"))
                                .retry(retryConfig -> retryConfig.setRetries(2)))
                        .uri("lb://user-service"))

                // Route pour les profils utilisateurs
                .route("user-service-profile", r -> r
                        .path("/api/profile/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("user-service")
                                        .setFallbackUri("forward:/fallback/user"))
                                .retry(retryConfig -> retryConfig.setRetries(2)))
                        .uri("lb://user-service"))

                // ============== CANDIDATE SERVICE ==============
                .route("candidate-service", r -> r
                        .path("/api/candidates/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("candidate-service")
                                        .setFallbackUri("forward:/fallback/candidate")))
                        .uri("lb://candidate-service"))

                // ============== JOB SERVICES ==============
                .route("job-requisition-service", r -> r
                        .path("/api/requisitions/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("job-requisition-service")
                                        .setFallbackUri("forward:/fallback/job")))
                        .uri("lb://job-requisition-service"))

                .route("job-posting-service", r -> r
                        .path("/api/postings/**", "/api/public/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("job-posting-service")
                                        .setFallbackUri("forward:/fallback/job")))
                        .uri("lb://job-posting-service"))

                // ============== DOCUMENT SERVICE ==============
                // Route pour les endpoints publics de documents (upload et download)
                .route("document-service-public", r -> r
                        .path("/api/documents/upload", "/api/documents/*/download")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("document-management-service")
                                        .setFallbackUri("forward:/fallback/document"))
                                .retry(retryConfig -> retryConfig.setRetries(2)))
                        .uri("lb://document-management-service"))

                // Route pour les endpoints privés de documents (authentifiés)
                .route("document-service-private", r -> r
                        .path("/api/documents/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("document-management-service")
                                        .setFallbackUri("forward:/fallback/document"))
                                .retry(retryConfig -> retryConfig.setRetries(2)))
                        .uri("lb://document-management-service"))

                // ============== API DOCUMENTATION ==============
                .route("auth-service-docs", r -> r
                        .path("/auth-service/v3/api-docs")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://auth-service"))

                .route("user-service-docs", r -> r
                        .path("/user-service/v3/api-docs")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://user-service"))

                .route("candidate-service-docs", r -> r
                        .path("/candidate-service/v3/api-docs")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://candidate-service"))

                .route("document-service-docs", r -> r
                        .path("/document-service/v3/api-docs")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://document-management-service"))

                .build();
    }
}