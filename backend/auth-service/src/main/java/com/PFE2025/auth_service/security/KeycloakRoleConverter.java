package com.PFE2025.auth_service.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Convertisseur pour extraire les rôles Keycloak du JWT et les transformer
 * en GrantedAuthority pour Spring Security.
 * Ajoute le préfixe ROLE_ pour suivre la convention de Spring Security.
 */
@Slf4j
public class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private static final String ROLE_PREFIX = "ROLE_";
    private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

    // Rôles autorisés dans l'application
    private static final Set<String> ALLOWED_ROLES = Set.of(
            "CEO",
            "CANDIDATE",
            "PROJECT_LEADER",
            "RH_ADMIN",
            "INTERNAL_SERVICE"
    );

    @SuppressWarnings("unchecked")
    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        // Récupérer les autorités par défaut (scopes, etc.)
        Collection<GrantedAuthority> defaultAuthorities = defaultConverter.convert(jwt);
        List<GrantedAuthority> grantedAuthorities = new ArrayList<>(defaultAuthorities != null ? defaultAuthorities : List.of());

        try {
            // Extraire les rôles du realm depuis la claim 'realm_access'
            extractRealmRoles(jwt, grantedAuthorities);

            // Extraire les rôles des ressources depuis la claim 'resource_access'
            extractResourceRoles(jwt, grantedAuthorities);
        } catch (Exception e) {
            log.warn("Erreur lors de l'extraction des rôles du JWT: {}", e.getMessage());
        }

        return grantedAuthorities;
    }

    @SuppressWarnings("unchecked")
    private void extractRealmRoles(Jwt jwt, List<GrantedAuthority> grantedAuthorities) {
        Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaims().get("realm_access");

        if (realmAccess == null) {
            return;
        }

        List<String> roles = (List<String>) realmAccess.get("roles");

        if (roles != null) {
            log.debug("Rôles realm bruts extraits: {}", roles);

            // Filtrer seulement les rôles autorisés
            List<String> filteredRoles = roles.stream()
                    .filter(ALLOWED_ROLES::contains)
                    .collect(Collectors.toList());

            List<GrantedAuthority> realmAuthorities = filteredRoles.stream()
                    .map(role -> new SimpleGrantedAuthority(ROLE_PREFIX + role.toUpperCase()))
                    .collect(Collectors.toList());

            grantedAuthorities.addAll(realmAuthorities);
            log.debug("Rôles realm filtrés et ajoutés: {}", filteredRoles);
        }
    }

    @SuppressWarnings("unchecked")
    private void extractResourceRoles(Jwt jwt, List<GrantedAuthority> grantedAuthorities) {
        Map<String, Object> resourceAccess = (Map<String, Object>) jwt.getClaims().get("resource_access");

        if (resourceAccess == null) {
            return;
        }

        // Extraire les rôles pour chaque ressource (client) listée
        resourceAccess.forEach((resource, value) -> {
            if (value instanceof Map) {
                Map<String, Object> resourceRolesMap = (Map<String, Object>) value;
                List<String> roles = (List<String>) resourceRolesMap.get("roles");

                if (roles != null) {
                    log.debug("Rôles ressource '{}' bruts extraits: {}", resource, roles);

                    // Filtrer seulement les rôles autorisés
                    List<String> filteredRoles = roles.stream()
                            .filter(ALLOWED_ROLES::contains)
                            .collect(Collectors.toList());

                    List<GrantedAuthority> resourceAuthorities = filteredRoles.stream()
                            .map(role -> new SimpleGrantedAuthority(ROLE_PREFIX + role.toUpperCase()))
                            .collect(Collectors.toList());

                    grantedAuthorities.addAll(resourceAuthorities);
                    log.debug("Rôles ressource '{}' filtrés et ajoutés: {}", resource, filteredRoles);
                }
            }
        });
    }
}