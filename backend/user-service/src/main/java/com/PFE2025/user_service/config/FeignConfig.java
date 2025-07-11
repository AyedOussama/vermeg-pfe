package com.PFE2025.user_service.config;

import feign.Logger;
import feign.RequestInterceptor;
import feign.codec.Decoder;
import feign.codec.ErrorDecoder;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Configuration
@Slf4j
public class FeignConfig {

    @Value("${USER_SERVICE_CLIENT_ID:user-service-client}")
    private String clientId;

    @Value("${USER_SERVICE_CLIENT_SECRET:PpYacJA4QjMVU3RUFp8Y4Mx4uKEp0geC}")
    private String clientSecret;

    // Token URI pour Keycloak
    @Value("${KEYCLOAK_URL:http://localhost:9090}/realms/${KEYCLOAK_REALM:vermeg-Platform}/protocol/openid-connect/token")
    private String tokenUri;

    // Rest of your code remains the same...
    @Bean
    public RequestInterceptor oauth2FeignRequestInterceptor() {
        return requestTemplate -> {
            log.debug("Adding OAuth2 token to Feign request");
            String accessToken = getAccessToken();
            if (accessToken != null) {
                requestTemplate.header("Authorization", "Bearer " + accessToken);
                log.debug("Added Bearer token to request");
            } else {
                log.error("Failed to obtain access token for service-to-service call");
            }
        };
    }

    private String getAccessToken() {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(clientId, clientSecret);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "client_credentials");
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);

            HttpEntity<MultiValueMap<String, String>> request =
                    new HttpEntity<>(params, headers);

            log.debug("Requesting token from: {} with client_id: {}", tokenUri, clientId);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    tokenUri, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String token = (String) response.getBody().get("access_token");
                log.debug("Successfully obtained access token");
                return token;
            }

            log.error("Failed to get token. Status: {}, Body: {}",
                    response.getStatusCode(), response.getBody());
            return null;

        } catch (Exception e) {
            log.error("Error obtaining access token: {}", e.getMessage(), e);
            return null;
        }
    }

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }

    @Bean
    public ErrorDecoder errorDecoder() {
        return new CustomErrorDecoder();
    }
}