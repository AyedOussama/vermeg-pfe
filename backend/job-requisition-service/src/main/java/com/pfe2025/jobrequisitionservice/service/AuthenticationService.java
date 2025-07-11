package com.pfe2025.jobrequisitionservice.service;

import com.pfe2025.jobrequisitionservice.exception.UnauthorizedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service responsable de l'extraction des informations utilisateur
 * à partir du contexte de sécurité.
 */
@Service
@Slf4j
public class AuthenticationService {

    /**
     * Récupère l'ID de l'utilisateur authentifié.
     *
     * @return L'ID de l'utilisateur courant
     * @throws UnauthorizedException si aucun utilisateur n'est authentifié
     */
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("No authenticated user found");
        }

        Object details = authentication.getDetails();
        if (details instanceof Map) {
            Map<String, String> userDetails = (Map<String, String>) details;
            String userId = userDetails.get("userId");
            if (userId != null && !userId.isEmpty()) {
                return userId;
            }
        } else if (details != null) {
            return details.toString();
        }

        return authentication.getName();
    }

    /**
     * Récupère le nom d'affichage de l'utilisateur authentifié.
     *
     * @return Le nom d'affichage de l'utilisateur courant
     * @throws UnauthorizedException si aucun utilisateur n'est authentifié
     */
    public String getCurrentUserDisplayName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("No authenticated user found");
        }

        Object details = authentication.getDetails();
        if (details instanceof Map) {
            Map<String, String> userDetails = (Map<String, String>) details;

            // First try to get the display name
            String displayName = userDetails.get("displayName");
            if (displayName != null && !displayName.isEmpty()) {
                return displayName;
            }

            // Next try full name
            String fullName = userDetails.get("fullName");
            if (fullName != null && !fullName.isEmpty()) {
                return fullName;
            }

            // Next try to construct from first and last name
            String firstName = userDetails.get("firstName");
            String lastName = userDetails.get("lastName");
            if (firstName != null && lastName != null) {
                return firstName + " " + lastName;
            }

            // Fall back to username
            String username = userDetails.get("username");
            if (username != null && !username.isEmpty()) {
                return username;
            }
        }

        return authentication.getName();
    }

    /**
     * Vérifie si l'utilisateur courant possède un rôle spécifique.
     *
     * @param role Le rôle à vérifier
     * @return true si l'utilisateur possède le rôle, false sinon
     */
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role) ||
                        authority.getAuthority().equals(role));
    }
}