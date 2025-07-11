package com.PFE2025.auth_service.controller;

import com.PFE2025.auth_service.dto.*;
import com.PFE2025.auth_service.exception.ResourceNotFoundException;
import com.PFE2025.auth_service.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Authentication and user management API")
public class AuthController {

    private final KeycloakService keycloakService;
    private final TokenService tokenService;
    private final CookieService cookieService;
    private final ForgotPasswordService forgotPasswordService;
    private final AuditService auditService;
    private final RateLimiterService rateLimiterService;

    // ==================== AUTHENTICATION ====================

    @Operation(summary = "Login user")
    @PostMapping("/login")
    public Mono<ResponseEntity<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request,
            ServerHttpRequest httpRequest,
            ServerHttpResponse response) {

        String clientIp = getClientIp(httpRequest);
        log.info("Login attempt for: {} from IP: {}", request.getEmail(), clientIp);

        return rateLimiterService.isLoginAllowed(request.getEmail())
                .flatMap(allowed -> {
                    if (!allowed) {
                        return auditService.logAuthEvent(
                                "unknown",
                                AuditService.AuditAction.LOGIN_FAILED.getValue(),
                                clientIp,
                                Map.of("email", request.getEmail(), "reason", "rate_limit_exceeded")
                        ).then(Mono.just(ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                                .body(TokenResponse.builder().build())));
                    }

                    return keycloakService.authenticate(request.getEmail(), request.getPassword())
                            .flatMap(tokenResponse ->
                                    keycloakService.getUserByEmail(request.getEmail())
                                            .flatMap(user -> {
                                                // Reset rate limit on successful login
                                                return rateLimiterService.resetLoginAttempts(request.getEmail())
                                                        .then(auditService.logAuthEvent(
                                                                user.getUserId(),
                                                                AuditService.AuditAction.LOGIN_SUCCESS.getValue(),
                                                                clientIp,
                                                                Map.of("email", request.getEmail())
                                                        ))
                                                        .then(Mono.just(user));
                                            })
                                            .map(user -> {
                                                // Set cookies
                                                cookieService.setAuthCookies(response,
                                                        tokenResponse.getToken(),
                                                        tokenResponse.getRefreshToken());

                                                // Build response
                                                return ResponseEntity.ok(TokenResponse.builder()
                                                        .accessToken(tokenResponse.getToken())
                                                        .refreshToken(tokenResponse.getRefreshToken())
                                                        .expiresIn(tokenResponse.getExpiresIn())
                                                        .tokenType("Bearer")
                                                        .userId(user.getUserId())
                                                        .fullName(user.getFullName())
                                                        .build());
                                            })
                            )
                            .onErrorResume(e -> {
                                // Log failure
                                return auditService.logAuthEvent(
                                        "unknown",
                                        AuditService.AuditAction.LOGIN_FAILED.getValue(),
                                        clientIp,
                                        Map.of("email", request.getEmail(), "error", e.getMessage())
                                ).then(Mono.error(e));
                            });
                });
    }

    @Operation(summary = "Logout user")
    @PostMapping("/logout")
    public Mono<ResponseEntity<Map<String, String>>> logout(
            ServerHttpRequest request,
            ServerHttpResponse response) {

        String refreshToken = cookieService.extractRefreshToken(request);
        String clientIp = getClientIp(request);

        // Clear cookies immediately
        cookieService.clearAuthCookies(response);

        return getCurrentUserId()
                .flatMap(userId -> auditService.logAuthEvent(
                        userId,
                        AuditService.AuditAction.LOGOUT.getValue(),
                        clientIp,
                        Map.of("method", "manual_logout")
                ))
                .then(refreshToken != null ?
                        keycloakService.logout(refreshToken) :
                        Mono.empty())
                .then(Mono.just(ResponseEntity.ok(Map.of("message", "Logged out successfully"))))
                .onErrorReturn(ResponseEntity.ok(Map.of("message", "Logged out successfully")));
    }

    @Operation(summary = "Refresh session")
    @PostMapping("/refresh")
    public Mono<ResponseEntity<TokenResponse>> refresh(
            ServerHttpRequest httpRequest,
            ServerHttpResponse response) {

        String refreshToken = cookieService.extractRefreshToken(httpRequest);
        String clientIp = getClientIp(httpRequest);

        if (refreshToken == null) {
            log.warn("Refresh token not found in cookies");
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
        }

        return keycloakService.refreshToken(refreshToken)
                .flatMap(tokenResponse -> {
                    // Update cookies
                    cookieService.setAuthCookies(response,
                            tokenResponse.getToken(),
                            tokenResponse.getRefreshToken());

                    // Log event
                    return tokenService.validateToken(tokenResponse.getToken())
                            .flatMap(validationResult -> auditService.logAuthEvent(
                                    validationResult.getUserId(),
                                    AuditService.AuditAction.TOKEN_REFRESH.getValue(),
                                    clientIp,
                                    Map.of("success", "true")
                            ))
                            .then(Mono.just(ResponseEntity.ok(TokenResponse.builder()
                                    .accessToken(tokenResponse.getToken())
                                    .refreshToken(tokenResponse.getRefreshToken())
                                    .expiresIn(tokenResponse.getExpiresIn())
                                    .tokenType("Bearer")
                                    .build())));
                })
                .doOnError(error -> log.error("Token refresh failed: {}", error.getMessage()));
    }

    @Operation(summary = "Validate token")
    @PostMapping("/validate")
    public Mono<ResponseEntity<TokenValidationResult>> validate(
            ServerHttpRequest request,
            @RequestBody(required = false) Map<String, String> body) {


        // 1. From cookie
        String token = cookieService.extractAccessToken(request);

        // 2. From Authorization header
        if (token == null) {
            String auth = request.getHeaders().getFirst("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                token = auth.substring(7);
            }
        }

        // 3. From request body
        if (token == null && body != null) {
            token = body.get("token");
        }

        if (token == null) {
            log.debug("No token found in request");
            return Mono.just(ResponseEntity.ok(TokenValidationResult.invalid()));
        }

        return tokenService.validateToken(token)
                .map(ResponseEntity::ok);
    }

    // ==================== PASSWORD MANAGEMENT ====================

    @Operation(summary = "Change password", security = @SecurityRequirement(name = "bearer-auth"))
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public Mono<ResponseEntity<Map<String, String>>> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            ServerHttpRequest httpRequest) {

        String clientIp = getClientIp(httpRequest);

        return getCurrentUserId()
                .flatMap(userId -> keycloakService.changePassword(
                                userId, request.getCurrentPassword(), request.getNewPassword())
                        .then(auditService.logAuthEvent(
                                userId,
                                AuditService.AuditAction.PASSWORD_CHANGED.getValue(),
                                clientIp,
                                Map.of("method", "user_change")
                        ))
                        .then(Mono.just(ResponseEntity.ok(Map.of("message", "Password changed successfully"))))
                )
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()));
    }

    @Operation(summary = "Request password reset - NOT SECURED AS REQUESTED")
    @PostMapping("/forgot-password/request")
    public Mono<ResponseEntity<Map<String, String>>> forgotPasswordRequest(
            @Valid @RequestBody ForgotPasswordRequest request,
            ServerHttpRequest httpRequest) {

        String clientIp = getClientIp(httpRequest);
        log.warn("⚠️ UNSECURED PASSWORD RESET REQUEST for: {} from IP: {}", request.getEmail(), clientIp);

        return forgotPasswordService.requestPasswordResetUnsecured(request.getEmail())
                .flatMap(resetInfo -> auditService.logAuthEvent(
                        resetInfo.get("userId"),
                        AuditService.AuditAction.PASSWORD_RESET_REQUESTED.getValue(),
                        clientIp,
                        Map.of("email", request.getEmail(), "method", "unsecured")
                ).then(Mono.just(ResponseEntity.ok(Map.of(
                        "message", "User found, you can reset password",
                        "userId", resetInfo.get("userId"),
                        "email", resetInfo.get("email"),
                        "fullName", resetInfo.get("fullName"),
                        "resetAllowed", "true"
                )))))
                .onErrorResume(ResourceNotFoundException.class, e ->
                        Mono.just(ResponseEntity.ok(Map.of(
                                "message", "User not found or not a candidate",
                                "resetAllowed", "false"
                        )))
                );
    }

    @Operation(summary = "Reset password directly - NOT SECURED AS REQUESTED")
    @PostMapping("/forgot-password/reset")
    public Mono<ResponseEntity<Map<String, String>>> forgotPasswordReset(
            @Valid @RequestBody ResetPasswordRequest request,
            ServerHttpRequest httpRequest) {

        String clientIp = getClientIp(httpRequest);
        log.warn("⚠️ UNSECURED PASSWORD RESET EXECUTION for user: {} from IP: {}", request.getUserId(), clientIp);

        return forgotPasswordService.resetPasswordDirectly(request.getUserId(), request.getNewPassword())
                .then(auditService.logAuthEvent(
                        request.getUserId(),
                        AuditService.AuditAction.PASSWORD_RESET_COMPLETED.getValue(),
                        clientIp,
                        Map.of("method", "unsecured_direct")
                ))
                .then(Mono.just(ResponseEntity.ok(Map.of(
                        "message", "Password reset successfully"
                ))))
                .onErrorResume(ResourceNotFoundException.class, e ->
                        Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of("error", "User not found")))
                );
    }

    // ==================== USER MANAGEMENT (Admin) ====================

    @Operation(summary = "Create user", security = @SecurityRequirement(name = "bearer-auth"))
    @PostMapping("/users")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN','INTERNAL_SERVICE')")
    public Mono<ResponseEntity<UserDTO>> createUser(
            @Valid @RequestBody UserCreateRequest request,
            ServerHttpRequest httpRequest) {

        String clientIp = getClientIp(httpRequest);
        log.info("Creating user: {} from IP: {}", request.getEmail(), clientIp);

        return getCurrentUserId()
                .flatMap(adminId -> keycloakService.createUser(request)
                        .flatMap(user -> auditService.logAuthEvent(
                                adminId,
                                AuditService.AuditAction.USER_CREATED.getValue(),
                                clientIp,
                                Map.of("created_user_id", user.getUserId(),
                                        "created_user_email", user.getEmail(),
                                        "roles", user.getRoles() != null ? user.getRoles().toString() : "[]")
                        ).then(Mono.just(user)))
                )
                .map(user -> ResponseEntity.status(HttpStatus.CREATED).body(user));
    }

    @Operation(summary = "Get all users", security = @SecurityRequirement(name = "bearer-auth"))
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'INTERNAL_SERVICE')")
    public Mono<ResponseEntity<List<UserDTO>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return keycloakService.getAllUsers(page, size)
                .map(ResponseEntity::ok)
                .doOnSuccess(r -> log.debug("Retrieved {} users",
                        r.getBody() != null ? r.getBody().size() : 0));
    }

    @Operation(summary = "Get user by ID", security = @SecurityRequirement(name = "bearer-auth"))
    @GetMapping("/users/{userId}")
//     @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN','PROJECT_LEADER')")
   @PreAuthorize("isAuthenticated()")
    public Mono<ResponseEntity<UserDTO>> getUser(@PathVariable String userId) {
        return keycloakService.getUserById(userId)
                .map(ResponseEntity::ok)
                .doOnSuccess(r -> log.debug("Retrieved user: {}", userId));
    }

    @Operation(summary = "Get user by email", security = @SecurityRequirement(name = "bearer-auth"))
    @GetMapping("/users/by-email/{email}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'INTERNAL_SERVICE')")
    public Mono<ResponseEntity<UserDTO>> getUserByEmail(@PathVariable String email) {
        return keycloakService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .doOnSuccess(r -> log.debug("Retrieved user by email: {}", email));
    }

    @Operation(summary = "Update user", security = @SecurityRequirement(name = "bearer-auth"))
    @PutMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'INTERNAL_SERVICE')")
    public Mono<ResponseEntity<UserDTO>> updateUser(
            @PathVariable String userId,
            @Valid @RequestBody UserCreateRequest request,
            ServerHttpRequest httpRequest) {

        String clientIp = getClientIp(httpRequest);
        log.info("Updating user: {} from IP: {}", userId, clientIp);

        return getCurrentUserId()
                .flatMap(adminId -> keycloakService.updateUser(userId, request)
                        .flatMap(user -> auditService.logAuthEvent(
                                adminId,
                                AuditService.AuditAction.USER_UPDATED.getValue(),
                                clientIp,
                                Map.of("updated_user_id", user.getUserId(),
                                        "changes", "profile_update")
                        ).then(Mono.just(user)))
                )
                .map(ResponseEntity::ok);
    }

    @Operation(summary = "Update user status", security = @SecurityRequirement(name = "bearer-auth"))
    @PatchMapping("/users/{userId}/status")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public Mono<ResponseEntity<UserDTO>> updateUserStatus(
            @PathVariable String userId,
            @RequestBody Map<String, Boolean> statusRequest,
            ServerHttpRequest httpRequest) {

        Boolean enabled = statusRequest.get("enabled");
        if (enabled == null) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        String clientIp = getClientIp(httpRequest);
        log.info("Updating user status: {} to enabled={} from IP: {}", userId, enabled, clientIp);

        return getCurrentUserId()
                .flatMap(adminId -> keycloakService.updateUserStatus(userId, enabled)
                        .flatMap(user -> auditService.logAuthEvent(
                                adminId,
                                AuditService.AuditAction.USER_STATUS_CHANGED.getValue(),
                                clientIp,
                                Map.of("updated_user_id", userId,
                                        "enabled", enabled.toString())
                        ).then(Mono.just(user)))
                )
                .map(ResponseEntity::ok);
    }

    @Operation(summary = "Update user roles", security = @SecurityRequirement(name = "bearer-auth"))
    @PutMapping("/users/{userId}/roles")
    @PreAuthorize("hasRole('CEO')")
    public Mono<ResponseEntity<UserDTO>> updateUserRoles(
            @PathVariable String userId,
            @RequestBody Map<String, Set<String>> rolesRequest,
            ServerHttpRequest httpRequest) {

        Set<String> roles = rolesRequest.get("roles");
        if (roles == null) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        String clientIp = getClientIp(httpRequest);
        log.info("Updating user roles: {} to roles={} from IP: {}", userId, roles, clientIp);

        return getCurrentUserId()
                .flatMap(adminId -> keycloakService.updateUserRoles(userId, roles)
                        .flatMap(user -> auditService.logAuthEvent(
                                adminId,
                                AuditService.AuditAction.USER_ROLES_UPDATED.getValue(),
                                clientIp,
                                Map.of("updated_user_id", userId,
                                        "new_roles", roles.toString())
                        ).then(Mono.just(user)))
                )
                .map(ResponseEntity::ok);
    }

    @Operation(summary = "Reset password by admin", security = @SecurityRequirement(name = "bearer-auth"))
    @PostMapping("/users/{userId}/reset-password")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN')")
    public Mono<ResponseEntity<Map<String, String>>> resetPasswordByAdmin(
            @PathVariable String userId,
            @RequestBody Map<String, String> passwordRequest,
            ServerHttpRequest httpRequest) {

        String password = passwordRequest.get("password");
        if (password == null || password.length() < 8) {
            return Mono.just(ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 8 characters")));
        }

        String clientIp = getClientIp(httpRequest);
        log.info("Admin resetting password for user: {} from IP: {}", userId, clientIp);

        return getCurrentUserId()
                .flatMap(adminId -> keycloakService.resetPassword(userId, password)
                        .then(auditService.logAuthEvent(
                                adminId,
                                AuditService.AuditAction.PASSWORD_RESET_COMPLETED.getValue(),
                                clientIp,
                                Map.of("reset_for_user_id", userId,
                                        "method", "admin_reset")
                        ))
                        .then(Mono.just(ResponseEntity.ok(Map.of("message", "Password reset successfully"))))
                );
    }

    @Operation(summary = "Delete user", security = @SecurityRequirement(name = "bearer-auth"))
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('CEO')")
    public Mono<ResponseEntity<Void>> deleteUser(
            @PathVariable String userId,
            ServerHttpRequest httpRequest) {

        String clientIp = getClientIp(httpRequest);
        log.info("Deleting user: {} from IP: {}", userId, clientIp);

        return getCurrentUserId()
                .flatMap(adminId -> keycloakService.deleteUser(userId)
                        .then(auditService.logAuthEvent(
                                adminId,
                                AuditService.AuditAction.USER_DELETED.getValue(),
                                clientIp,
                                Map.of("deleted_user_id", userId)
                        ))
                        .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                );
    }

    // ==================== SPECIAL ENDPOINTS FOR INTERNAL SERVICES ====================

    @Operation(summary = "Get current user info", security = @SecurityRequirement(name = "bearer-auth"))
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public Mono<ResponseEntity<TokenValidationResult>> getCurrentUser() {
        return ReactiveSecurityContextHolder.getContext()
                .map(context -> context.getAuthentication())
                .filter(auth -> auth != null && auth.isAuthenticated())
                .map(auth -> (Jwt) auth.getPrincipal())
                .flatMap(jwt -> tokenService.validateToken(jwt.getTokenValue()))
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()));
    }

    @Operation(summary = "Clear token validation cache (Debug endpoint)")
    @PostMapping("/debug/clear-cache")
    @PreAuthorize("hasRole('CEO')")
    public Mono<ResponseEntity<Map<String, String>>> clearTokenCache() {
        return tokenService.clearAllTokenCache()
                .then(Mono.just(ResponseEntity.ok(Map.of(
                        "message", "Token validation cache cleared successfully",
                        "timestamp", java.time.Instant.now().toString()
                ))))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to clear cache")));
    }

    @Operation(summary = "Bulk get users by IDs", security = @SecurityRequirement(name = "bearer-auth"))
    @PostMapping("/users/details-bulk")
    @PreAuthorize("hasAnyRole('CEO', 'RH_ADMIN', 'INTERNAL_SERVICE')")
    public Mono<ResponseEntity<Map<String, UserDTO>>> getUsersDetailsByIds(
            @RequestBody List<String> keycloakIds) {

        if (keycloakIds == null || keycloakIds.isEmpty() || keycloakIds.size() > 100) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        log.debug("Bulk fetching {} users", keycloakIds.size());

        // Process in parallel with error handling
        return Flux.fromIterable(keycloakIds)
                .flatMap(id -> keycloakService.getUserById(id)
                        .map(user -> Map.entry(id, user))
                        .onErrorResume(e -> {
                            log.warn("Failed to fetch user {}: {}", id, e.getMessage());
                            return Mono.empty();
                        }))
                .collectMap(Map.Entry::getKey, Map.Entry::getValue)
                .map(ResponseEntity::ok)
                .doOnSuccess(r -> log.debug("Bulk fetch completed, found {} users",
                        r.getBody() != null ? r.getBody().size() : 0));
    }

    @Operation(summary = "Health check")
    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, String>>> health() {
        return Mono.just(ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "auth-service",
                "timestamp", String.valueOf(System.currentTimeMillis())
        )));
    }

    // ==================== HELPER METHODS ====================

    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddress() != null ?
                request.getRemoteAddress().getAddress().getHostAddress() : "unknown";
    }

    private Mono<String> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(context -> context.getAuthentication())
                .filter(auth -> auth != null && auth.isAuthenticated())
                .map(auth -> ((Jwt) auth.getPrincipal()).getSubject())
                .switchIfEmpty(Mono.just("anonymous"));
    }
}