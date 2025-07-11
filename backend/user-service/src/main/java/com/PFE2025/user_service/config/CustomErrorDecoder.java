package com.PFE2025.user_service.config;

import com.PFE2025.user_service.exception.ResourceAlreadyExistsException;
import com.PFE2025.user_service.exception.ServiceUnavailableException;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.Response;
import feign.Util;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class CustomErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultErrorDecoder = new Default();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Exception decode(String methodKey, Response response) {
        String responseBody = "";
        try {
            if (response.body() != null) {
                responseBody = Util.toString(response.body().asReader());
                log.error("Feign error - Method: {}, Status: {}, Body: {}",
                        methodKey, response.status(), responseBody);
            }
        } catch (Exception e) {
            log.error("Error reading response body", e);
        }

        switch (response.status()) {
            case 401:
                return new ServiceUnavailableException(
                        "Authentication failed with auth-service. Check client credentials.");
            case 403:
                return new ServiceUnavailableException(
                        "Access denied. The service account may not have required permissions.");
            case 409:
                return new ResourceAlreadyExistsException(
                        "Resource already exists: " + responseBody);
            case 500:
                log.error("Auth service internal error: {}", responseBody);
                return new ServiceUnavailableException(
                        "Auth service encountered an error: " + responseBody);
            default:
                if (response.status() >= 500) {
                    return new ServiceUnavailableException(
                            "Auth service is unavailable (status " + response.status() + ")");
                }
                return defaultErrorDecoder.decode(methodKey, response);
        }
    }
}