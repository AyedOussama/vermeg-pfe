package com.pfe2025.interview_service.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

/**
 * OpenAPI configuration for service documentation.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Interview Service API")
                        .description("API for managing interviews with Google Calendar integration")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("Vermeg Platform Team")
                                .email("platform@vermeg.com")
                                .url("https://vermeg.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://vermeg.com/terms")))
                .servers(Arrays.asList(
                        new Server()
                                .url("/")
                                .description("Default Server"),
                        new Server()
                                .url("https://api.vermeg-recruitment.com")
                                .description("Production Server")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT token from Keycloak OAuth2")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}