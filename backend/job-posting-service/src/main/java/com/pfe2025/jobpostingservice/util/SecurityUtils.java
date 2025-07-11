package com.pfe2025.jobpostingservice.util;



import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Map;
import java.util.Optional;

/**
 * Utilitaires de sécurité pour l'accès aux informations de l'utilisateur connecté.
 */
public class SecurityUtils {

    private SecurityUtils() {
        // Classe utilitaire, constructeur privé
    }

    /**
     * Récupère l'ID de l'utilisateur connecté.
     *
     * @return L'ID de l'utilisateur ou empty si non connecté
     */
    public static Optional<String> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        // Essayer d'abord d'obtenir l'ID depuis les détails de l'authentification
        if (authentication.getDetails() instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) authentication.getDetails();
            if (details.containsKey("userId")) {
                return Optional.ofNullable((String) details.get("userId"));
            }
        }

        // Si JWT, essayer d'obtenir l'ID depuis le token
        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return Optional.ofNullable(jwt.getSubject());
        }

        // Fallback au nom d'utilisateur
        return Optional.ofNullable(authentication.getName());
    }

    /**
     * Récupère le nom complet de l'utilisateur connecté.
     *
     * @return Le nom complet de l'utilisateur ou empty si non connecté
     */
    public static Optional<String> getCurrentUserFullName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        // Essayer d'obtenir le nom depuis les détails de l'authentification
        if (authentication.getDetails() instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) authentication.getDetails();

            // Essayer fullName
            if (details.containsKey("fullName")) {
                return Optional.ofNullable((String) details.get("fullName"));
            }

            // Essayer de construire à partir de firstName et lastName
            String firstName = (String) details.get("firstName");
            String lastName = (String) details.get("lastName");
            if (firstName != null && lastName != null) {
                return Optional.of(firstName + " " + lastName);
            }

            // Essayer username
            if (details.containsKey("username")) {
                return Optional.ofNullable((String) details.get("username"));
            }
        }

        // Fallback au nom d'utilisateur
        return Optional.ofNullable(authentication.getName());
    }

    /**
     * Vérifie si l'utilisateur connecté a un rôle spécifique.
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
                    String auth = authority.getAuthority();
                    return auth.equals("ROLE_" + role) || auth.equals(role);
                });
    }
}
