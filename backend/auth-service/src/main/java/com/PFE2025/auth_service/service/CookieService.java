package com.PFE2025.auth_service.service;

import com.PFE2025.auth_service.config.CookieConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpCookie;
import org.springframework.http.ResponseCookie;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class CookieService {

    private final CookieConfig cookieConfig;

    /**
     * Set authentication cookies in the response
     */
    public void setAuthCookies(ServerHttpResponse response, String accessToken, String refreshToken) {
        if (accessToken == null || refreshToken == null) {
            log.warn("Attempting to set cookies with null tokens");
            return;
        }

        response.addCookie(createAccessTokenCookie(accessToken));
        response.addCookie(createRefreshTokenCookie(refreshToken));
        log.debug("Auth cookies set successfully for domain: {}", cookieConfig.getDomain());
    }

    /**
     * Clear authentication cookies
     */
    public void clearAuthCookies(ServerHttpResponse response) {
        response.addCookie(clearCookie(cookieConfig.getAccessTokenName()));
        response.addCookie(clearCookie(cookieConfig.getRefreshTokenName()));
        log.debug("Auth cookies cleared");
    }

    /**
     * Extract access token from cookies
     */
    public String extractAccessToken(ServerHttpRequest request) {
        return extractCookie(request, cookieConfig.getAccessTokenName());
    }

    /**
     * Extract refresh token from cookies
     */
    public String extractRefreshToken(ServerHttpRequest request) {
        return extractCookie(request, cookieConfig.getRefreshTokenName());
    }

    /**
     * Check if auth cookies are present
     */
    public boolean hasAuthCookies(ServerHttpRequest request) {
        return extractAccessToken(request) != null && extractRefreshToken(request) != null;
    }

    private ResponseCookie createAccessTokenCookie(String token) {
        return ResponseCookie.from(cookieConfig.getAccessTokenName(), token)
                .httpOnly(true)
                .secure(cookieConfig.isSecure())
                .sameSite(cookieConfig.getSameSite())
                .domain(cookieConfig.getDomain())
                .path(cookieConfig.getPath())
                .maxAge(Duration.ofSeconds(cookieConfig.getAccessTokenMaxAge()))
                .build();
    }

    private ResponseCookie createRefreshTokenCookie(String token) {
        return ResponseCookie.from(cookieConfig.getRefreshTokenName(), token)
                .httpOnly(true)
                .secure(cookieConfig.isSecure())
                .sameSite(cookieConfig.getSameSite())
                .domain(cookieConfig.getDomain())
                .path(cookieConfig.getPath())
                .maxAge(Duration.ofSeconds(cookieConfig.getRefreshTokenMaxAge()))
                .build();
    }

    private ResponseCookie clearCookie(String name) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(cookieConfig.isSecure())
                .sameSite(cookieConfig.getSameSite())
                .domain(cookieConfig.getDomain())
                .path(cookieConfig.getPath())
                .maxAge(Duration.ZERO)
                .build();
    }

    private String extractCookie(ServerHttpRequest request, String cookieName) {
        HttpCookie cookie = request.getCookies().getFirst(cookieName);
        if (cookie != null) {
            log.trace("Cookie '{}' found", cookieName);
            return cookie.getValue();
        }
        log.trace("Cookie '{}' not found in request", cookieName);
        return null;
    }
}