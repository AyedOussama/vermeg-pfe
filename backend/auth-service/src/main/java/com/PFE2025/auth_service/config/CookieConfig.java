package com.PFE2025.auth_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.cookies")
@Data
public class CookieConfig {

    private String accessTokenName = "access_token";
    private String refreshTokenName = "refresh_token";
    private String domain; // null par défaut pour same-origin
    private String path = "/";
    private boolean secure = false; // true en production
    private String sameSite = "Lax"; // Lax, Strict, None
    private int accessTokenMaxAge = 900; // 15 minutes
    private int refreshTokenMaxAge = 86400; // 24 heures
}