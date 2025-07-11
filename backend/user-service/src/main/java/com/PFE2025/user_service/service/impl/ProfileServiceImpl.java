package com.PFE2025.user_service.service.impl;

import com.PFE2025.user_service.dto.response.CandidateProfileResponse;
import com.PFE2025.user_service.dto.response.CeoProfileResponse;
import com.PFE2025.user_service.dto.response.UserDTO;
import com.PFE2025.user_service.dto.response.ProjectLeaderProfileResponse;
import com.PFE2025.user_service.dto.response.RhAdminProfileResponse;
import com.PFE2025.user_service.exception.ResourceNotFoundException;
import com.PFE2025.user_service.exception.AuthenticationFailedException;
import com.PFE2025.user_service.model.CandidateProfile;
import com.PFE2025.user_service.model.CeoProfile;
import com.PFE2025.user_service.model.ProjectLeaderProfile;
import com.PFE2025.user_service.model.RhAdminProfile;
import com.PFE2025.user_service.repository.CandidateProfileRepository;
import com.PFE2025.user_service.repository.CeoProfileRepository;
import com.PFE2025.user_service.repository.ProjectLeaderProfileRepository;
import com.PFE2025.user_service.repository.RhAdminProfileRepository;
import com.PFE2025.user_service.service.ProfileService;
import com.PFE2025.user_service.util.CandidateProfileMapper;
import com.PFE2025.user_service.util.CeoProfileMapper;
import com.PFE2025.user_service.util.ProjectLeaderProfileMapper;
import com.PFE2025.user_service.util.RhAdminProfileMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import java.util.*;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileServiceImpl implements ProfileService {

    // Repositories pour tous les types de profils
    private final CandidateProfileRepository candidateProfileRepository;
    private final CeoProfileRepository ceoProfileRepository;
    private final ProjectLeaderProfileRepository projectLeaderProfileRepository;
    private final RhAdminProfileRepository rhAdminProfileRepository;

    // Mappers
    private final CandidateProfileMapper candidateProfileMapper;
    private final CeoProfileMapper ceoProfileMapper;
    private final ProjectLeaderProfileMapper projectLeaderProfileMapper;
    private final RhAdminProfileMapper rhAdminProfileMapper;
    
    @Override
    @Transactional
    public Object getCurrentUserProfile() {
        // Récupérer les informations de l'utilisateur connecté depuis le JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof Jwt)) {
            throw new AuthenticationFailedException("User not authenticated or authentication principal is not a JWT");
        }
        
        Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
        String keycloakId = jwtPrincipal.getSubject();
        
        // Récupérer les rôles depuis le JWT
        Set<String> rolesSet = extractRolesFromJwt(jwtPrincipal);
        
        // Récupérer les autres informations depuis le JWT
        String firstName = jwtPrincipal.getClaimAsString("given_name");
        String lastName = jwtPrincipal.getClaimAsString("family_name");
        String email = jwtPrincipal.getClaimAsString("email");
        Boolean enabled = jwtPrincipal.getClaimAsBoolean("enabled");
        
        log.debug("Getting profile for user: {} with roles: {}", keycloakId, rolesSet);

        // Router directement vers le bon profil selon les rôles (SANS utiliser l'entité User)
        if (rolesSet.contains("CANDIDATE")) {
            return getCandidateProfileWithJwtData(keycloakId, rolesSet, firstName, lastName, email, enabled);
        } else if (rolesSet.contains("CEO")) {
            return getCeoProfileWithJwtData(keycloakId, rolesSet, firstName, lastName, email, enabled);
        } else if (rolesSet.contains("PROJECT_LEADER")) {
            return getProjectLeaderProfileWithJwtData(keycloakId, rolesSet, firstName, lastName, email, enabled);
        } else if (rolesSet.contains("RH_ADMIN")) {
            return getRhAdminProfileWithJwtData(keycloakId, rolesSet, firstName, lastName, email, enabled);
        } else {
            // Utilisateur avec des rôles non reconnus
            log.error("User with unrecognized roles: {} for keycloakId: {}", rolesSet, keycloakId);
            throw new ResourceNotFoundException("User profile not found - unrecognized user type");
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public CandidateProfileResponse getCandidateProfile(String keycloakId) {
        log.debug("Getting candidate profile for keycloakId: {}", keycloakId);
        
        CandidateProfile profile = candidateProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for keycloakId: " + keycloakId));
        
        return candidateProfileMapper.toResponse(profile);
    }
    
    @Override
    @Transactional
    public CandidateProfileResponse updateCandidatePhoto(String keycloakId, String photoUrl) {
        log.debug("Updating photo for candidate: {} with URL: {}", keycloakId, photoUrl);
        
        CandidateProfile profile = candidateProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for keycloakId: " + keycloakId));
        
        profile.setPhoto(photoUrl);
        CandidateProfile savedProfile = candidateProfileRepository.save(profile);
        
        log.info("Photo updated successfully for candidate: {}", keycloakId);
        return candidateProfileMapper.toResponse(savedProfile);
    }
    
    /**
     * Méthode privée pour récupérer le profil candidat enrichi avec les données JWT
     */
    private CandidateProfileResponse getCandidateProfileWithJwtData(String keycloakId, Set<String> roles, 
                                                                   String firstName, String lastName, 
                                                                   String email, Boolean enabled) {
        CandidateProfile profile = candidateProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for keycloakId: " + keycloakId));
        
        CandidateProfileResponse response = candidateProfileMapper.toResponse(profile);
        
        // Enrichir avec les données JWT (qui sont les plus à jour)
        response.setRoles(roles);
        response.setStatus(enabled != null && !enabled ? "INACTIVE" : "ACTIVE");
        
        // Utiliser les données JWT si elles sont présentes, sinon garder celles du profil
        if (firstName != null) response.setFirstName(firstName);
        if (lastName != null) response.setLastName(lastName);
        if (email != null) response.setEmail(email);
        
        // Recalculer le fullName avec les données les plus récentes
        response.setFullName(response.getFirstName() + " " + response.getLastName());
        
        return response;
    }

    /**
     * Extrait les rôles métier depuis le JWT Keycloak
     */
    private Set<String> extractRolesFromJwt(Jwt jwt) {
        Set<String> allowedBusinessRoles = Set.of("CEO", "PROJECT_LEADER", "RH_ADMIN", "CANDIDATE");
        Set<String> roles = new HashSet<>();

        try {
            // Récupérer les rôles depuis realm_access
            if (jwt.hasClaim("realm_access")) {
                Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
                if (realmAccess != null && realmAccess.containsKey("roles")) {
                    @SuppressWarnings("unchecked")
                    List<String> realmRoles = (List<String>) realmAccess.get("roles");
                    if (realmRoles != null) {
                        roles.addAll(realmRoles.stream()
                                .filter(allowedBusinessRoles::contains)
                                .collect(Collectors.toSet()));
                    }
                }
            }

            log.debug("Extracted business roles from JWT: {}", roles);
        } catch (Exception e) {
            log.warn("Failed to extract roles from JWT: {}", e.getMessage());
        }

        return roles;
    }

    /**
     * Méthode privée pour récupérer le profil CEO enrichi avec les données JWT
     * Crée automatiquement le profil s'il n'existe pas
     */
    private Object getCeoProfileWithJwtData(String keycloakId, Set<String> roles,
                                           String firstName, String lastName,
                                           String email, Boolean enabled) {
        // Chercher le profil CEO
        Optional<CeoProfile> profileOpt = ceoProfileRepository.findByKeycloakId(keycloakId);

        if (profileOpt.isPresent()) {
            // Profil CEO trouvé - retourner le profil complet enrichi
            CeoProfile profile = profileOpt.get();

            // Enrichir avec les données JWT
            profile.setFirstName(firstName);
            profile.setLastName(lastName);
            profile.setEmail(email);
            profile.setRoles(roles.stream().toList());
            profile.setStatus(enabled != null && !enabled ? "INACTIVE" : "ACTIVE");
            profile.updateFullName();

            return ceoProfileMapper.toResponse(profile);
        } else {
            // Pas de profil CEO - le créer automatiquement
            log.info("No CEO profile found for keycloakId: {}, creating automatically", keycloakId);

            CeoProfile newProfile = new CeoProfile();
            newProfile.setKeycloakId(keycloakId);
            newProfile.setFirstName(firstName);
            newProfile.setLastName(lastName);
            newProfile.setEmail(email);
            newProfile.setRoles(roles.stream().toList());
            newProfile.setUserType("CEO");
            newProfile.setStatus(enabled != null && !enabled ? "INACTIVE" : "ACTIVE");
            newProfile.updateFullName();
            newProfile.setCreatedAt(LocalDateTime.now());
            newProfile.setUpdatedAt(LocalDateTime.now());

            // Sauvegarder le nouveau profil
            CeoProfile savedProfile = ceoProfileRepository.save(newProfile);
            log.info("CEO profile created automatically for keycloakId: {} with id: {}", keycloakId, savedProfile.getId());

            return ceoProfileMapper.toResponse(savedProfile);
        }
    }

    /**
     * Méthode privée pour récupérer le profil Project Leader enrichi avec les données JWT
     */
    private Object getProjectLeaderProfileWithJwtData(String keycloakId, Set<String> roles,
                                                     String firstName, String lastName,
                                                     String email, Boolean enabled) {
        // Chercher le profil Project Leader
        Optional<ProjectLeaderProfile> profileOpt = projectLeaderProfileRepository.findByKeycloakId(keycloakId);

        if (profileOpt.isPresent()) {
            // Profil Project Leader trouvé - retourner le profil complet enrichi
            ProjectLeaderProfile profile = profileOpt.get();

            // Enrichir avec les données JWT
            profile.setFirstName(firstName);
            profile.setLastName(lastName);
            profile.setEmail(email);
            profile.setRoles(roles.stream().toList());
            profile.setStatus(enabled != null && !enabled ? "INACTIVE" : "ACTIVE");
            profile.updateFullName();

            return projectLeaderProfileMapper.toResponse(profile);
        } else {
            // Pas de profil Project Leader spécialisé - retourner profil basique
            log.warn("No specialized Project Leader profile found for keycloakId: {}, returning basic profile", keycloakId);
            return createBasicUserDTO(keycloakId, roles, firstName, lastName, email, enabled, "PROJECT_LEADER");
        }
    }

    /**
     * Méthode privée pour récupérer le profil RH Admin enrichi avec les données JWT
     */
    private Object getRhAdminProfileWithJwtData(String keycloakId, Set<String> roles,
                                               String firstName, String lastName,
                                               String email, Boolean enabled) {
        // Chercher le profil RH Admin
        Optional<RhAdminProfile> profileOpt = rhAdminProfileRepository.findByKeycloakId(keycloakId);

        if (profileOpt.isPresent()) {
            // Profil RH Admin trouvé - retourner le profil complet enrichi
            RhAdminProfile profile = profileOpt.get();

            // Enrichir avec les données JWT
            profile.setFirstName(firstName);
            profile.setLastName(lastName);
            profile.setEmail(email);
            profile.setRoles(roles.stream().toList());
            profile.setStatus(enabled != null && !enabled ? "INACTIVE" : "ACTIVE");
            profile.updateFullName();

            return rhAdminProfileMapper.toResponse(profile);
        } else {
            // Pas de profil RH Admin spécialisé - retourner profil basique
            log.warn("No specialized RH Admin profile found for keycloakId: {}, returning basic profile", keycloakId);
            return createBasicUserDTO(keycloakId, roles, firstName, lastName, email, enabled, "RH_ADMIN");
        }
    }

    /**
     * Méthode utilitaire pour créer un UserDTO basique enrichi avec les données JWT
     */
    private UserDTO createBasicUserDTO(String keycloakId, Set<String> roles,
                                      String firstName, String lastName,
                                      String email, Boolean enabled, String userType) {
        UserDTO userDto = new UserDTO();
        userDto.setKeycloakId(keycloakId);
        userDto.setFirstName(firstName);
        userDto.setLastName(lastName);
        userDto.setFullName(firstName != null && lastName != null ? firstName + " " + lastName : null);
        userDto.setEmail(email);
        userDto.setRoles(roles);
        userDto.setUserType(userType);
        userDto.setEnabled(enabled != null ? enabled : true);

        return userDto;
    }
}
