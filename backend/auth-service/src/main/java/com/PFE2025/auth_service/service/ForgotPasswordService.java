package com.PFE2025.auth_service.service;

import com.PFE2025.auth_service.dto.UserDTO;
import com.PFE2025.auth_service.exception.InvalidTokenException;
import com.PFE2025.auth_service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForgotPasswordService {

    private final KeycloakService keycloakService;

    /**
     * Request password reset - VERSION NON SÉCURISÉE COMME DEMANDÉ
     * ⚠️ ATTENTION: Cette méthode n'est PAS sécurisée et ne devrait jamais être utilisée en production
     */
    public Mono<Map<String, String>> requestPasswordResetUnsecured(String email) {
        log.warn("⚠️ UNSECURED password reset request for email: {}", email);

        return keycloakService.getUserByEmail(email)
                .flatMap(user -> {
                    // Check if user has CANDIDATE role
                    boolean isCandidate = user.getRoles() != null &&
                            user.getRoles().stream().anyMatch(role ->
                                    role.equals("CANDIDATE") ||
                                            role.equals("ROLE_CANDIDATE") ||
                                            role.toUpperCase().contains("CANDIDATE"));

                    if (!isCandidate) {
                        return Mono.error(new ResourceNotFoundException(
                                "Only candidates can use forgot password feature"));
                    }

                    // ⚠️ RETOURNER DIRECTEMENT LES INFOS (NON SÉCURISÉ)
                    return Mono.just(Map.of(
                            "userId", user.getUserId(),
                            "email", user.getEmail(),
                            "fullName", user.getFullName(),
                            "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                            "lastName", user.getLastName() != null ? user.getLastName() : ""
                    ));
                })
                .doOnSuccess(result ->
                        log.warn("⚠️ UNSECURED: User info exposed for password reset: {}", email))
                .doOnError(e ->
                        log.info("Password reset request failed for: {} - {}", email, e.getMessage()));
    }

    /**
     * Reset password directly - VERSION NON SÉCURISÉE COMME DEMANDÉ
     * ⚠️ ATTENTION: Cette méthode permet de réinitialiser n'importe quel mot de passe sans vérification
     */
    public Mono<Void> resetPasswordDirectly(String userId, String newPassword) {
        if (userId == null || userId.trim().isEmpty()) {
            return Mono.error(new InvalidTokenException("User ID is required"));
        }

        if (newPassword == null || newPassword.length() < 8) {
            return Mono.error(new InvalidTokenException("Password must be at least 8 characters"));
        }

        log.warn("⚠️ UNSECURED direct password reset for userId: {}", userId);

        return keycloakService.resetPassword(userId, newPassword)
                .doOnSuccess(v ->
                        log.warn("⚠️ UNSECURED: Password reset completed for userId: {}", userId))
                .doOnError(e ->
                        log.error("Password reset failed for userId: {} - {}", userId, e.getMessage()));
    }

    /**
     * Get candidate by email (for forgot password - returns only if candidate)
     */
    public Mono<UserDTO> getCandidateByEmail(String email) {
        return keycloakService.getUserByEmail(email)
                .filter(user -> user.getRoles() != null &&
                        user.getRoles().stream().anyMatch(role ->
                                role.toUpperCase().contains("CANDIDATE")))
                .switchIfEmpty(Mono.error(
                        new ResourceNotFoundException("Candidate not found with email: " + email)));
    }
}