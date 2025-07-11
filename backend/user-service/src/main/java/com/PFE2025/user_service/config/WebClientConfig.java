package com.PFE2025.user_service.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * Configuration des clients WebClient pour les appels vers d'autres microservices.
 */
@Configuration
public class WebClientConfig {
    
    @Value("${document-service.base-url:http://localhost:7010/api/documents}")
    private String documentServiceBaseUrl;
    
    /**
     * WebClient pour appeler le document-management-service.
     * Configuré pour les uploads de fichiers et les opérations sur documents.
     */
    @Bean
    @Qualifier("documentServiceWebClient")
    public WebClient documentServiceWebClient() {
        return WebClient.builder()
                .baseUrl(documentServiceBaseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .codecs(configurer -> {
                    // Augmenter la taille max pour les uploads de fichiers (10MB)
                    configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024);
                })
                .build();
    }
    
    /**
     * WebClient générique pour d'autres services si nécessaire.
     */
    @Bean
    @Qualifier("genericWebClient")
    public WebClient genericWebClient() {
        return WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .codecs(configurer -> {
                    configurer.defaultCodecs().maxInMemorySize(1024 * 1024); // 1MB par défaut
                })
                .build();
    }
}
