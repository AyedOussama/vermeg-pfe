package com.PFE2025.auth_service.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import jakarta.annotation.PostConstruct;
import jakarta.ws.rs.client.ClientBuilder;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Configuration pour Keycloak Admin Client et propriétés liées
 */
@Configuration
@EnableScheduling  // Ajouté pour activer @Scheduled
@Data
@Slf4j
@ConfigurationProperties(prefix = "keycloak")
public class KeycloakConfig {

    private String authServerUrl;
    private String realm;
    private String resource;
    private Credentials credentials;
    private String adminUsername;
    private String adminPassword;
    private List<String> allowedRoles;
    private ClientTimeouts clientTimeouts = new ClientTimeouts(); // Valeur par défaut

    @Data
    public static class Credentials {
        private String secret;
    }

    @Data
    public static class ClientTimeouts {
        private int connection = 5000;  // 5 secondes par défaut
        private int read = 10000;       // 10 secondes par défaut
    }

    @PostConstruct
    public void init() {
        log.info("Configuration Keycloak initialisée:");
        log.info("- Server URL: {}", authServerUrl);
        log.info("- Realm: {}", realm);
        log.info("- Client ID: {}", resource);
        log.info("- Connection timeout: {}ms", clientTimeouts.getConnection());
        log.info("- Read timeout: {}ms", clientTimeouts.getRead());
    }

    @Bean
    public Keycloak keycloakAdminClient() {
        log.debug("Création du client Keycloak Admin");

        try {
            ClientBuilder clientBuilder = ClientBuilder.newBuilder()
                    .connectTimeout(clientTimeouts.getConnection(), TimeUnit.MILLISECONDS)
                    .readTimeout(clientTimeouts.getRead(), TimeUnit.MILLISECONDS);

            Keycloak keycloak = KeycloakBuilder.builder()
                    .serverUrl(authServerUrl)
                    .realm("master")  // Le realm pour se connecter en admin est toujours master
                    .clientId("admin-cli")
                    .username(adminUsername)
                    .password(adminPassword)
                    .grantType(OAuth2Constants.PASSWORD)
                    .resteasyClient(((ResteasyClientBuilder) clientBuilder).build())
                    .build();

            log.info("Client Keycloak Admin créé avec succès");
            return keycloak;

        } catch (Exception e) {
            log.error("Erreur lors de la création du client Keycloak Admin", e);
            throw new RuntimeException("Impossible de créer le client Keycloak Admin", e);
        }
    }

    /**
     * Méthode planifiée pour renouveler le token de l'admin régulièrement
     * afin d'éviter les expirations
     */
    @Scheduled(fixedRate = 50 * 60 * 1000) // 50 minutes (avant expiration standard de 60 min)
    public void refreshKeycloakClient() {
        log.debug("Rafraîchissement planifié du token Keycloak Admin");
        try {
            // Force un renouvellement du token
            keycloakAdminClient().tokenManager().grantToken();
            log.debug("Token Keycloak Admin rafraîchi avec succès");
        } catch (Exception e) {
            log.error("Échec du rafraîchissement du token Keycloak Admin: {}", e.getMessage());
            // Ne pas faire échouer l'application si le refresh échoue
        }
    }
}