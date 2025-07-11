package com.PFE2025.auth_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final ReactiveRedisTemplate<String, Object> redisTemplate;
    private static final String AUDIT_KEY_PREFIX = "audit:";
    private static final Duration AUDIT_TTL = Duration.ofDays(30);

    public Mono<Void> logAuthEvent(String userId, String action, String ip, Map<String, Object> details) {
        Map<String, Object> auditEntry = new HashMap<>();
        auditEntry.put("userId", userId != null ? userId : "anonymous");
        auditEntry.put("action", action);
        auditEntry.put("ip", ip != null ? ip : "unknown");
        auditEntry.put("timestamp", Instant.now().toString());
        auditEntry.put("details", details != null ? details : new HashMap<>());

        String key = AUDIT_KEY_PREFIX + action.toLowerCase() + ":" + System.currentTimeMillis();

        log.info("AUDIT: User {} performed {} from IP {}",
                auditEntry.get("userId"), action, auditEntry.get("ip"));

        return redisTemplate.opsForValue()
                .set(key, auditEntry, AUDIT_TTL)
                .doOnSuccess(result -> log.debug("Audit event saved: {}", key))
                .doOnError(error -> log.error("Failed to save audit event: {}", error.getMessage()))
                .onErrorResume(error -> {
                    // Ne pas faire échouer l'opération si l'audit échoue
                    log.error("Audit failed but continuing operation: {}", error.getMessage());
                    return Mono.empty();
                })
                .then();
    }

    public enum AuditAction {
        LOGIN_SUCCESS("login_success"),
        LOGIN_FAILED("login_failed"),
        LOGOUT("logout"),
        PASSWORD_CHANGED("password_changed"),
        PASSWORD_RESET_REQUESTED("password_reset_requested"),
        PASSWORD_RESET_COMPLETED("password_reset_completed"),
        USER_CREATED("user_created"),
        USER_UPDATED("user_updated"),
        USER_DELETED("user_deleted"),
        USER_STATUS_CHANGED("user_status_changed"),
        USER_ROLES_UPDATED("user_roles_updated"),
        TOKEN_REFRESH("token_refresh"),
        TOKEN_VALIDATION("token_validation"),
        UNAUTHORIZED_ACCESS("unauthorized_access");

        private final String value;

        AuditAction(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}