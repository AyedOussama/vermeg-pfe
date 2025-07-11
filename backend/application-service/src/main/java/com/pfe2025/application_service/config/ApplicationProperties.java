package com.pfe2025.application_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration

@Data
public class ApplicationProperties {
    private AIProperties ai = new AIProperties();
    private IntegrationProperties integration = new IntegrationProperties();

    @Data
    public static class AIProperties {
        private EvaluationProperties evaluation = new EvaluationProperties();

        @Data
        public static class EvaluationProperties {
            private boolean enabled = true;
            private double autoThresholdAccept = 85.0;
            private double autoThresholdReject = 40.0;
            private String model = "meta-llama/Llama-3.3-70B-Instruct-Turbo";
            private int timeoutSeconds = 40;
            private int maxTokens = 4096;
            private double temperature = 0.5;
            private boolean stream = false;
            private String apiKey;
        }
    }

    @Data
    public static class IntegrationProperties {
        private ServiceProperties candidateService = new ServiceProperties();
        private ServiceProperties jobPostingService = new ServiceProperties();
        private ServiceProperties documentService = new ServiceProperties();
        private ServiceProperties interviewService = new ServiceProperties();
        private ServiceProperties aiService = new ServiceProperties();

        @Data
        public static class ServiceProperties {
            private String baseUrl;
            private int timeoutSeconds = 10;
            private int retryMaxAttempts = 3;
            private int retryDelay = 1000;
            private boolean enableExponentialBackoff = true;
        }
    }
}