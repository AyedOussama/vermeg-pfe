package com.pfe2025.jobpostingservice.service;

import com.pfe2025.jobpostingservice.exception.AuthorizationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service de gestion de l'authentification et des autorisations.
 */
@Service
@Slf4j
public class AuthenticationService {

    /**
     * Vérifie si l'utilisateur est authentifié.
     *
     * @return true si l'utilisateur est authentifié
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    /**
     * Vérifie si l'utilisateur a un rôle spécifique.
     *
     * @param role Le rôle à vérifier
     * @return true si l'utilisateur a le rôle
     */
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equals("ROLE_" + role) || authority.equals(role));
    }

    /**
     * Vérifie si l'utilisateur a l'un des rôles spécifiés.
     *
     * @param roles Les rôles à vérifier
     * @return true si l'utilisateur a au moins un des rôles
     */
    public boolean hasAnyRole(String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        for (String role : roles) {
            if (authorities.contains("ROLE_" + role) || authorities.contains(role)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Vérifie que l'utilisateur a le rôle spécifié, sinon lance une exception.
     *
     * @param role Le rôle requis
     * @throws AuthorizationException si l'utilisateur n'a pas le rôle
     */
    public void checkRole(String role) {
        if (!hasRole(role)) {
            throw new AuthorizationException("Vous n'avez pas les droits nécessaires pour cette opération (rôle " + role + " requis)");
        }
    }

    /**
     * Récupère l'ID de l'utilisateur courant.
     *
     * @return L'ID de l'utilisateur
     */
    public Optional<String> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        // Essayer d'abord d'obtenir l'ID depuis les détails
        if (authentication.getDetails() instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) authentication.getDetails();
            if (details.containsKey("userId")) {
                return Optional.ofNullable((String) details.get("userId"));
            }
        }

        // Fallback au nom (subject)
        return Optional.ofNullable(authentication.getName());
    }

    /**
     * Récupère le nom complet de l'utilisateur courant.
     *
     * @return Le nom complet de l'utilisateur
     */
    public Optional<String> getCurrentUserFullName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        // Essayer d'obtenir le nom depuis les détails
        if (authentication.getDetails() instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) authentication.getDetails();

            // Essayer d'abord fullName
            if (details.containsKey("fullName")) {
                String fullName = (String) details.get("fullName");
                if (fullName != null && !fullName.isBlank()) {
                    return Optional.of(fullName);
                }
            }

            // Ensuite, essayer de construire à partir de firstName et lastName
            String firstName = (String) details.get("firstName");
            String lastName = (String) details.get("lastName");
            if (firstName != null && lastName != null) {
                return Optional.of(firstName + " " + lastName);
            }

            // Ensuite, essayer username
            if (details.containsKey("username")) {
                String username = (String) details.get("username");
                if (username != null && !username.isBlank()) {
                    return Optional.of(username);
                }
            }
        }

        // Fallback au nom
        return Optional.ofNullable(authentication.getName());
    }

    /**
     * Vérifie si l'utilisateur est le créateur de la ressource.
     *
     * @param creatorId L'ID du créateur de la ressource
     * @return true si l'utilisateur est le créateur
     */
    public boolean isCreator(String creatorId) {
        return getCurrentUserId()
                .map(userId -> userId.equals(creatorId))
                .orElse(false);
    }

    /**
     * Vérifie si l'utilisateur a le droit de modifier une ressource.
     * Autorisé si administrateur ou créateur.
     *
     * @param creatorId L'ID du créateur de la ressource
     * @return true si l'utilisateur peut modifier
     */
    public boolean canModify(String creatorId) {
        return hasRole("RH_ADMIN") || isCreator(creatorId);
    }
}
