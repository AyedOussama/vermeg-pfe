package com.pfe2025.ai_processing_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull; // Ajout pour les timeouts
import jakarta.validation.constraints.Positive; // Ajout pour les timeouts

@Configuration
@ConfigurationProperties(prefix = "together-ai")
@Data
@Validated // Activer la validation des contraintes
public class TogetherAiConfig {

    // CORRECTION: Utiliser @NotBlank au lieu de laisser la possibilité d'une clé vide
    @NotBlank(message = "Together AI API key (TOGETHER_API_KEY) is required")
    private String apiKey; // Sera injecté depuis l'environnement

    @NotBlank(message = "Together AI model name is required")
    private String model;

    @NotBlank(message = "Together AI base URL is required")
    private String baseUrl;

    @NotBlank(message = "Together AI chat endpoint is required")
    private String chatEndpoint;

    // Optionnel: Ajouter des timeouts avec validation
    @Positive(message = "Connect timeout must be positive")
    private Integer connectTimeoutMs; // Millisecondes

    @Positive(message = "Read timeout must be positive")
    private Integer readTimeoutMs; // Millisecondes
}

