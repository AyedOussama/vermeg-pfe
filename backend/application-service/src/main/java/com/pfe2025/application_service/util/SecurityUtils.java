package com.pfe2025.application_service.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Map;
import java.util.Optional;

/**
 * Utilitaire pour accéder aux informations de sécurité.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Slf4j
public class SecurityUtils {

    /**
     * Récupère l'ID de l'utilisateur courant.
     *
     * @return L'ID de l'utilisateur (Keycloak subject) ou vide si non authentifié
     */
    public static Optional<String> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        if (authentication instanceof JwtAuthenticationToken) {
            Jwt jwt = ((JwtAuthenticationToken) authentication).getToken();
            return Optional.ofNullable(jwt.getSubject());
        }

        return Optional.ofNullable(authentication.getName());
    }

    /**
     * Récupère le nom complet de l'utilisateur courant.
     *
     * @return Le nom complet de l'utilisateur ou vide si non disponible
     */
    public static Optional<String> getCurrentUserFullName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        if (authentication instanceof JwtAuthenticationToken) {
            Jwt jwt = ((JwtAuthenticationToken) authentication).getToken();

            String firstName = getClaimAsString(jwt, "given_name");
            String lastName = getClaimAsString(jwt, "family_name");

            if (firstName != null && lastName != null) {
                return Optional.of(firstName + " " + lastName);
            }

            // Essayer avec name si available
            String name = getClaimAsString(jwt, "name");
            if (name != null) {
                return Optional.of(name);
            }

            // Fallback sur preferred_username
            String username = getClaimAsString(jwt, "preferred_username");
            if (username != null) {
                return Optional.of(username);
            }
        }

        return Optional.ofNullable(authentication.getName());
    }

    /**
     * Vérifie si l'utilisateur courant a un rôle spécifique.
     *
     * @param role Le rôle à vérifier
     * @return true si l'utilisateur a le rôle
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> {
                    String authorityName = authority.getAuthority();
                    return authorityName.equals("ROLE_" + role) || authorityName.equals(role);
                });
    }

    /**
     * Vérifie si l'utilisateur courant est un candidat.
     *
     * @return true si l'utilisateur est un candidat
     */
    public static boolean isCandidate() {
        return hasRole("CANDIDATE");
    }

    /**
     * Vérifie si l'utilisateur courant est un administrateur RH.
     *
     * @return true si l'utilisateur est un administrateur RH
     */
    public static boolean isRHAdmin() {
        return hasRole("RH_ADMIN");
    }

    /**
     * Récupère une réclamation (claim) du token JWT en tant que chaîne.
     *
     * @param jwt Le token JWT
     * @param claimName Le nom de la réclamation
     * @return La valeur de la réclamation ou null si non présente
     */
    private static String getClaimAsString(Jwt jwt, String claimName) {
        Object claim = jwt.getClaim(claimName);
        return claim instanceof String ? (String) claim : null;
    }

    /**
     * Récupère une réclamation (claim) du token JWT en tant que Map.
     *
     * @param jwt Le token JWT
     * @param claimName Le nom de la réclamation
     * @return La valeur de la réclamation ou null si non présente
     */
    @SuppressWarnings("unchecked")
    private static Map<String, Object> getClaimAsMap(Jwt jwt, String claimName) {
        Object claim = jwt.getClaim(claimName);
        return claim instanceof Map ? (Map<String, Object>) claim : null;
    }
}