package com.pfe2025.document_management_service.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private static final String ROLE_PREFIX = "ROLE_";
    private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

    @SuppressWarnings("unchecked")
    @Override
    public Collection<GrantedAuthority> convert(@NonNull Jwt jwt) {
        log.debug("KeycloakRoleConverter: Starting conversion for JWT with subject {}", jwt.getSubject());

        Collection<GrantedAuthority> defaultAuthorities = defaultConverter.convert(jwt);
        List<GrantedAuthority> grantedAuthorities = new ArrayList<>(defaultAuthorities != null ? defaultAuthorities : List.of());

        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null) {
            List<String> roles = (List<String>) realmAccess.get("roles");
            if (roles != null) {
                log.debug("KeycloakRoleConverter: Realm roles found: {}", roles);
                for (String role : roles) {
                    grantedAuthorities.add(new SimpleGrantedAuthority(ROLE_PREFIX + role.toUpperCase()));
                    grantedAuthorities.add(new SimpleGrantedAuthority(role));
                }
            }
        }

        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        if (resourceAccess != null) {
            resourceAccess.forEach((resource, accessMap) -> {
                if (accessMap instanceof Map) {
                    Map<String, Object> resourceRolesMap = (Map<String, Object>) accessMap;
                    List<String> roles = (List<String>) resourceRolesMap.get("roles");
                    if (roles != null) {
                        log.debug("KeycloakRoleConverter: Resource roles for '{}': {}", resource, roles);
                        for (String role : roles) {
                            grantedAuthorities.add(new SimpleGrantedAuthority(ROLE_PREFIX + role.toUpperCase()));
                            grantedAuthorities.add(new SimpleGrantedAuthority(role));
                        }
                    }
                }
            });
        }

        Collection<GrantedAuthority> finalAuthorities = grantedAuthorities.stream().distinct().collect(Collectors.toList());
        log.debug("KeycloakRoleConverter: Final authorities generated: {}", finalAuthorities);
        return finalAuthorities;
    }
}