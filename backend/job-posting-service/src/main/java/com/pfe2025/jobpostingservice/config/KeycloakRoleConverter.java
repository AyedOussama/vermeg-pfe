package com.pfe2025.jobpostingservice.config;



import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Convertisseur qui extrait les rôles et les informations utilisateur d'un JWT Keycloak
 * pour les transformer en un token d'authentification Spring Security.
 */
@Component
public class KeycloakRoleConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private static final String ROLE_PREFIX = "ROLE_";
    private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAuthorities(jwt);

        // Créer un token d'authentification avec les informations utilisateur
        JwtAuthenticationToken token = new JwtAuthenticationToken(jwt, authorities);

        // Extraire les détails utilisateur du token Keycloak
        Map<String, Object> details = extractUserDetails(jwt);
        token.setDetails(details);

        return token;
    }

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        // Commencer avec les autorités standard (basées sur scope)
        Collection<GrantedAuthority> defaultAuthorities = defaultConverter.convert(jwt);
        Set<GrantedAuthority> authorities = new HashSet<>(defaultAuthorities != null ? defaultAuthorities : Collections.emptySet());

        // Extraire les rôles du realm (realm_access.roles)
        Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaims().get("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            List<String> roles = (List<String>) realmAccess.get("roles");
            for (String role : roles) {
                // Ajouter avec le préfixe ROLE_ pour @PreAuthorize
                authorities.add(new SimpleGrantedAuthority(ROLE_PREFIX + role.toUpperCase()));
                // Ajouter également sans préfixe pour la compatibilité
                authorities.add(new SimpleGrantedAuthority(role));
            }
        }

        // Extraire les rôles des ressources (resource_access.*.roles)
        Map<String, Object> resourceAccess = (Map<String, Object>) jwt.getClaims().get("resource_access");
        if (resourceAccess != null) {
            resourceAccess.forEach((resource, value) -> {
                if (value instanceof Map) {
                    Map<String, Object> resourceRoles = (Map<String, Object>) value;
                    if (resourceRoles.containsKey("roles")) {
                        List<String> roles = (List<String>) resourceRoles.get("roles");
                        for (String role : roles) {
                            // Format avec préfixe ROLE_
                            authorities.add(new SimpleGrantedAuthority(ROLE_PREFIX + role.toUpperCase()));
                            // Format sans préfixe
                            authorities.add(new SimpleGrantedAuthority(role));
                            // Format avec nom de ressource
                            authorities.add(new SimpleGrantedAuthority(resource + "_" + role));
                        }
                    }
                }
            });
        }

        return authorities;
    }

    private Map<String, Object> extractUserDetails(Jwt jwt) {
        Map<String, Object> details = new HashMap<>();

        // Extraire l'ID utilisateur (sub) - obligatoire
        details.put("userId", jwt.getSubject());

        // Extraire le nom d'utilisateur préféré
        details.put("username", jwt.getClaimAsString("preferred_username"));

        // Extraire les informations personnelles
        details.put("firstName", jwt.getClaimAsString("given_name"));
        details.put("lastName", jwt.getClaimAsString("family_name"));
        details.put("email", jwt.getClaimAsString("email"));

        // Utiliser le nom complet fourni dans le token, s'il existe
        String fullName = jwt.getClaimAsString("name");
        if (fullName != null && !fullName.isBlank()) {
            details.put("fullName", fullName);
        } else {
            // Sinon, construire à partir des noms/prénoms s'ils existent
            String firstName = jwt.getClaimAsString("given_name");
            String lastName = jwt.getClaimAsString("family_name");
            if (firstName != null && lastName != null) {
                details.put("fullName", firstName + " " + lastName);
            }
        }

        // Inclure les informations supplémentaires utiles
        details.put("emailVerified", jwt.getClaimAsBoolean("email_verified"));
        details.put("sessionId", jwt.getClaimAsString("sid"));

        return details;
    }
}
