package com.pfe2025.jobpostingservice.config;



import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configuration du client pour l'API Together.AI.
 */
@Configuration
@ConfigurationProperties(prefix = "app.ai")
@Getter
@Setter
public class AIClientConfig {

    private String togetherApiKey;
    private String togetherApiUrl;
    private String model;
    private boolean enabled;

    /**
     * Crée un WebClient configuré pour l'API Together.AI.
     */
    @Bean
    public WebClient togetherAiWebClient() {
        return WebClient.builder()
                .baseUrl(togetherApiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + togetherApiKey)
                .build();
    }
}
