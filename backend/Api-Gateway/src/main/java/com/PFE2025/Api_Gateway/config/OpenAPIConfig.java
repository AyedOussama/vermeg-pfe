package com.PFE2025.Api_Gateway.config;



import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Vermeg Recruitment Platform - API Gateway")
                        .description("Unified API documentation for all microservices in the Vermeg intelligent recruitment platform")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Vermeg Development Team")
                                .email("support@vermeg.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://www.vermeg.com")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT token with Bearer prefix: Bearer <token>")));
    }
}