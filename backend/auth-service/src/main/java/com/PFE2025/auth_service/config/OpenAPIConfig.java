package com.PFE2025.auth_service.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Value("${server.port:7001}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // Informations de base
                .info(new Info()
                        .title("Auth Service API")
                        .version("1.0.0")
                        .description("""
                                Service d'authentification et de gestion des utilisateurs avec Keycloak.
                                
                                ## 🔐 Authentification
                                
                                Ce service utilise deux méthodes d'authentification :
                                
                                ### 1. 🍪 Cookies HttpOnly (Recommandé pour les applications web)
                                - Les cookies sont automatiquement gérés par le navigateur
                                - Utilisez `/auth/login` pour vous connecter
                                - Les cookies seront automatiquement inclus dans toutes les requêtes suivantes
                                
                                ### 2. 🎫 Bearer Token (Pour les API et applications mobiles)
                                - Incluez le token dans le header : `Authorization: Bearer <token>`
                                - Obtenez le token depuis la réponse de `/auth/login`
                                
                               
                                ## 🚀 Guide de démarrage rapide
                                
                                1. **Se connecter** : POST `/auth/login` avec email et password
                                2. **Vérifier l'authentification** : GET `/auth/me`
                                3. **Se déconnecter** : POST `/auth/logout`
                                """)
                        .contact(new Contact()
                                .name("Équipe Développement")
                                .email("dev@vermeg.com"))
                        .license(new License()
                                .name("Propriétaire")
                                .url("https://vermeg.com")))

                // Serveurs
                .servers(Arrays.asList(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Serveur de développement local"),
                        new Server()
                                .url("http://localhost:8080")
                                .description("Gateway (si utilisé)"),
                        new Server()
                                .url("https://api.vermeg-platform.com")
                                .description("Production")
                ))

                // Sécurité globale
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .addSecurityItem(new SecurityRequirement().addList("cookieAuth"))

                // Composants de sécurité
                .components(new Components()
                        // Bearer Token
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Entrez le JWT token obtenu depuis /auth/login"))
                        // Cookie Auth
                        .addSecuritySchemes("cookieAuth",
                                new SecurityScheme()
                                        .name("cookieAuth")
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.COOKIE)
                                        .name("access_token")
                                        .description("Cookie HttpOnly automatiquement géré par le navigateur")));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("1. Public")
                .displayName("1. APIs Publiques")
                .pathsToMatch(
                        "/auth/login",
                        "/auth/logout",
                        "/auth/refresh",
                        "/auth/validate",
                        "/auth/forgot-password/**",
                        "/auth/health"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi authenticatedApi() {
        return GroupedOpenApi.builder()
                .group("2. Authenticated")
                .displayName("2. APIs Authentifiées")
                .pathsToMatch(
                        "/auth/me",
                        "/auth/change-password"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("3. Admin")
                .displayName("3. APIs Administration")
                .pathsToMatch(
                        "/auth/users/**"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("4. All")
                .displayName("4. Toutes les APIs")
                .pathsToMatch("/auth/**")
                .build();
    }
}