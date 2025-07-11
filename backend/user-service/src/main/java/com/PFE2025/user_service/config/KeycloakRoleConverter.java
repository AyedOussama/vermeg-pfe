package com.PFE2025.user_service.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Convertit un JWT Keycloak en AbstractAuthenticationToken avec les rôles extraits.
 */
@Component
@Slf4j
public class KeycloakRoleConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String ROLE_PREFIX = "ROLE_";
    private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAuthorities(jwt);
        return new JwtAuthenticationToken(jwt, authorities, getPrincipalClaimName(jwt));
    }

    private String getPrincipalClaimName(Jwt jwt) {
        String claimName = "preferred_username";
        return jwt.hasClaim(claimName) ? jwt.getClaimAsString(claimName) : jwt.getSubject();
    }

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        Collection<GrantedAuthority> authorities = new ArrayList<>(defaultConverter.convert(jwt));

        try {
            // Extraire les rôles du realm depuis la claim 'realm_access'
            if (jwt.hasClaim("realm_access")) {
                Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
                if (realmAccess.containsKey("roles")) {
                    @SuppressWarnings("unchecked")
                    List<String> roles = (List<String>) realmAccess.get("roles");
                    authorities.addAll(roles.stream()
                            .map(role -> new SimpleGrantedAuthority(ROLE_PREFIX + role.toUpperCase()))
                            .collect(Collectors.toList()));
                }
            }

            // Extraire les rôles des ressources depuis la claim 'resource_access'
            if (jwt.hasClaim("resource_access")) {
                Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
                resourceAccess.forEach((resource, access) -> {
                    if (access instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> resourceMap = (Map<String, Object>) access;
                        if (resourceMap.containsKey("roles")) {
                            @SuppressWarnings("unchecked")
                            List<String> roles = (List<String>) resourceMap.get("roles");
                            authorities.addAll(roles.stream()
                                    .map(role -> new SimpleGrantedAuthority(ROLE_PREFIX + role.toUpperCase()))
                                    .collect(Collectors.toList()));
                        }
                    }
                });
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction des rôles du JWT: {}", e.getMessage(), e);
        }

        log.debug("Authorities extraites: {}", authorities);
        return authorities;
    }
}