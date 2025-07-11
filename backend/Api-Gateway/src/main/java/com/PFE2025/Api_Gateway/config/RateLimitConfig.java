package com.PFE2025.Api_Gateway.config;



import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.AntPathMatcher;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "rate-limiting")
@Data
public class RateLimitConfig {

    private boolean enabled = true;
    private DefaultConfig defaultConfig = new DefaultConfig();
    private List<EndpointConfig> endpoints;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Data
    public static class DefaultConfig {
        private int limit = 100;
        private int duration = 60; // seconds
    }

    @Data
    public static class EndpointConfig {
        private String path;
        private int limit;
        private int duration; // seconds
    }

    /**
     * Obtient la configuration de rate limit pour un path donné
     */
    public EndpointConfig getConfigForPath(String path) {
        if (endpoints != null) {
            for (EndpointConfig endpoint : endpoints) {
                if (pathMatcher.match(endpoint.getPath(), path)) {
                    return endpoint;
                }
            }
        }

        // Retourner la configuration par défaut
        EndpointConfig defaultEndpoint = new EndpointConfig();
        defaultEndpoint.setPath("/**");
        defaultEndpoint.setLimit(defaultConfig.getLimit());
        defaultEndpoint.setDuration(defaultConfig.getDuration());
        return defaultEndpoint;
    }
}
