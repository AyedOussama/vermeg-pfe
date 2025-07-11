package com.PFE2025.user_service.service.impl;

import com.PFE2025.user_service.dto.request.RhAdminCreateRequest;
import com.PFE2025.user_service.dto.request.RhAdminUpdateRequest;
import com.PFE2025.user_service.dto.request.UserCreateRequest;
import com.PFE2025.user_service.dto.response.AuthServiceUserDTO;
import com.PFE2025.user_service.dto.response.RhAdminProfileResponse;
import com.PFE2025.user_service.exception.ResourceAlreadyExistsException;
import com.PFE2025.user_service.exception.ResourceNotFoundException;
import com.PFE2025.user_service.model.RhAdminProfile;
import com.PFE2025.user_service.model.User;
import com.PFE2025.user_service.model.UserType;
import com.PFE2025.user_service.repository.RhAdminProfileRepository;
import com.PFE2025.user_service.repository.UserRepository;
import com.PFE2025.user_service.service.AuthServiceClient;
import com.PFE2025.user_service.service.RhAdminService;
import com.PFE2025.user_service.util.RhAdminProfileMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Implémentation du service RhAdminService.
 * Gère toutes les opérations CRUD et la logique métier pour les RH Admins.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RhAdminServiceImpl implements RhAdminService {

    private final RhAdminProfileRepository rhAdminProfileRepository;
    private final UserRepository userRepository;
    private final AuthServiceClient authServiceClient;
    private final RhAdminProfileMapper rhAdminProfileMapper;

    @Override
    @Transactional
    public RhAdminProfileResponse createRhAdmin(RhAdminCreateRequest request) {
        log.info("🚀 DÉBUT CRÉATION RH ADMIN - Email: {}", request.getEmail());

        // Validation préliminaire
        validateCreateRequest(request);

        // Générer username depuis email si absent
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            String generatedUsername = request.getEmail().split("@")[0];
            request.setUsername(generatedUsername);
            log.info("📝 Username généré depuis email: {} -> {}", request.getEmail(), generatedUsername);
        }

        try {
            // === ÉTAPE 1 : CRÉER COMPTE KEYCLOAK ===
            log.info("📝 ÉTAPE 1 - Création compte Keycloak pour: {}", request.getEmail());

            UserCreateRequest userCreateRequest = rhAdminProfileMapper.toUserCreateRequest(request);
            AuthServiceUserDTO authUser = authServiceClient.createUser(userCreateRequest);
            String keycloakId = authUser.getUserId();
            
            log.info("✅ KEYCLOAK CRÉÉ - ID: {} pour email: {}", keycloakId, request.getEmail());

            // === ÉTAPE 2 : VÉRIFIER SI PROFIL EXISTE DÉJÀ ===
            if (rhAdminProfileRepository.existsByKeycloakId(keycloakId)) {
                log.warn("⚠️ PROFIL RH ADMIN EXISTANT - keycloakId: {} existe déjà", keycloakId);
                RhAdminProfile existingProfile = rhAdminProfileRepository.findByKeycloakId(keycloakId)
                        .orElseThrow(() -> new IllegalStateException("Inconsistent state"));
                return rhAdminProfileMapper.enrichWithAuthData(existingProfile, authUser);
            }

            // === ÉTAPE 3 : CRÉER USER BASIQUE (COMPATIBILITÉ) ===
            log.info("👤 ÉTAPE 3 - Création User basique pour keycloakId: {}", keycloakId);
            
            if (!userRepository.existsByKeycloakId(keycloakId)) {
                User basicUser = User.builder()
                        .keycloakId(keycloakId)
                        .phone(request.getPhone())
                        .department(request.getDepartment())
                        .userType(UserType.INTERNAL)
                        .build();
                userRepository.save(basicUser);
                log.info("✅ USER BASIQUE CRÉÉ pour keycloakId: {}", keycloakId);
            }

            // === ÉTAPE 4 : CRÉER PROFIL RH ADMIN COMPLET ===
            log.info("📋 ÉTAPE 4 - Création profil RH Admin complet pour keycloakId: {}", keycloakId);

            RhAdminProfile profile = rhAdminProfileMapper.fromCreateRequest(request);
            profile.setKeycloakId(keycloakId);
            profile.updateFullName();

            RhAdminProfile savedProfile = rhAdminProfileRepository.save(profile);
            log.info("✅ PROFIL RH ADMIN CRÉÉ - ID: {} pour keycloakId: {}", 
                    savedProfile.getId(), keycloakId);

            // === ÉTAPE 5 : CRÉATION TERMINÉE ===
            log.info("🎉 CRÉATION RH ADMIN TERMINÉE - keycloakId: {}, profileId: {}", 
                    keycloakId, savedProfile.getId());

            return rhAdminProfileMapper.enrichWithAuthData(savedProfile, authUser);

        } catch (ResourceAlreadyExistsException e) {
            log.warn("❌ CRÉATION ÉCHOUÉE - Email déjà utilisé: {}", request.getEmail());
            throw e;
        } catch (Exception e) {
            log.error("❌ ERREUR CRÉATION RH ADMIN - Email: {} - {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to create RH Admin: " + e.getMessage(), e);
        }
    }



    @Override
    @Transactional(readOnly = true)
    public RhAdminProfileResponse getRhAdminByKeycloakId(String keycloakId) {
        log.debug("Getting RH Admin profile by keycloakId: {}", keycloakId);
        
        RhAdminProfile profile = rhAdminProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("RhAdminProfile not found for keycloakId: " + keycloakId));

        return enrichProfileWithAuthData(profile);
    }

    @Override
    @Transactional
    public RhAdminProfileResponse updateRhAdmin(String id, RhAdminUpdateRequest request) {
        log.debug("Updating RH Admin profile with id: {}", id);

        RhAdminProfile profile = rhAdminProfileRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("RhAdminProfile", id));

        // Mettre à jour les champs du profil
        rhAdminProfileMapper.updateFromRequest(request, profile);
        profile.updateFullName();

        RhAdminProfile savedProfile = rhAdminProfileRepository.save(profile);
        log.info("✅ PROFIL RH ADMIN MIS À JOUR - ID: {}", savedProfile.getId());

        return enrichProfileWithAuthData(savedProfile);
    }

    @Override
    @Transactional
    public void deleteRhAdmin(String id) {
        log.debug("Deleting RH Admin profile with id: {}", id);

        RhAdminProfile profile = rhAdminProfileRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("RhAdminProfile", id));

        String keycloakId = profile.getKeycloakId();

        try {
            // Supprimer le profil RH Admin
            rhAdminProfileRepository.delete(profile);
            log.info("✅ PROFIL RH ADMIN SUPPRIMÉ - ID: {}", id);

            // Supprimer l'utilisateur de base si il existe
            userRepository.findByKeycloakId(keycloakId).ifPresent(user -> {
                userRepository.delete(user);
                log.info("✅ USER BASIQUE SUPPRIMÉ pour keycloakId: {}", keycloakId);
            });

            // Supprimer le compte Keycloak
            authServiceClient.deleteUser(keycloakId);
            log.info("✅ COMPTE KEYCLOAK SUPPRIMÉ - ID: {}", keycloakId);

        } catch (Exception e) {
            log.error("❌ ERREUR SUPPRESSION RH ADMIN - ID: {} - {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete RH Admin: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RhAdminProfileResponse> getAllRhAdmins(Pageable pageable) {
        log.debug("Getting all RH Admins with pagination: {}", pageable);
        
        Page<RhAdminProfile> profiles = rhAdminProfileRepository.findAll(pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RhAdminProfileResponse> searchRhAdmins(String keyword, Pageable pageable) {
        log.debug("Searching RH Admins with keyword: {} and pagination: {}", keyword, pageable);
        
        Page<RhAdminProfile> profiles = rhAdminProfileRepository.searchByKeyword(keyword, pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    // === MÉTHODES UTILITAIRES PRIVÉES ===

    private void validateCreateRequest(RhAdminCreateRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getFirstName() == null || request.getFirstName().isBlank()) {
            throw new IllegalArgumentException("First name is required");
        }
        if (request.getLastName() == null || request.getLastName().isBlank()) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (request.getDepartment() == null || request.getDepartment().isBlank()) {
            throw new IllegalArgumentException("Department is required");
        }

    }

    private RhAdminProfileResponse enrichProfileWithAuthData(RhAdminProfile profile) {
        try {
            AuthServiceUserDTO authUser = authServiceClient.getUserById(profile.getKeycloakId());
            return rhAdminProfileMapper.enrichWithAuthData(profile, authUser);
        } catch (Exception e) {
            log.warn("Failed to fetch auth data for keycloakId: {}, returning profile without auth data",
                    profile.getKeycloakId());
            return rhAdminProfileMapper.toResponse(profile);
        }
    }

    // === IMPLÉMENTATION DES AUTRES MÉTHODES ===

    @Override
    @Transactional(readOnly = true)
    public Page<RhAdminProfileResponse> getRhAdminsByDepartment(String department, Pageable pageable) {
        log.debug("Getting RH Admins by department: {} with pagination: {}", department, pageable);

        Page<RhAdminProfile> profiles = rhAdminProfileRepository.findByDepartmentContainingIgnoreCase(department, pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RhAdminProfileResponse> getRhAdminsByAccessLevel(String accessLevel, Pageable pageable) {
        log.debug("Getting RH Admins by access level: {} with pagination: {}", accessLevel, pageable);

        try {
            RhAdminProfile.AccessLevel level = RhAdminProfile.AccessLevel.valueOf(accessLevel.toUpperCase());
            Page<RhAdminProfile> profiles = rhAdminProfileRepository.findByAccessLevel(level, pageable);
            return profiles.map(this::enrichProfileWithAuthData);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid access level: {}", accessLevel);
            return Page.empty(pageable);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RhAdminProfileResponse> getRhAdminsByLocation(String location, Pageable pageable) {
        log.debug("Getting RH Admins by location: {} with pagination: {}", location, pageable);

        Page<RhAdminProfile> profiles = rhAdminProfileRepository.findByLocationContainingIgnoreCase(location, pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RhAdminProfileResponse> getRhAdminsBySpecialization(String specialization, Pageable pageable) {
        log.debug("Getting RH Admins by specialization: {} with pagination: {}", specialization, pageable);

        Page<RhAdminProfile> profiles = rhAdminProfileRepository.findByHrSpecializationsContaining(specialization, pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RhAdminProfileResponse> getRhAdminsByMinRecruitmentExperience(Integer minExperience, Pageable pageable) {
        log.debug("Getting RH Admins by min recruitment experience: {} with pagination: {}", minExperience, pageable);

        Page<RhAdminProfile> profiles = rhAdminProfileRepository.findByRecruitmentExperienceGreaterThanEqual(minExperience, pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    @Override
    @Transactional(readOnly = true)
    public long countRhAdmins() {
        return rhAdminProfileRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public long countRhAdminsByDepartment(String department) {
        return rhAdminProfileRepository.countByDepartmentContainingIgnoreCase(department);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByKeycloakId(String keycloakId) {
        return rhAdminProfileRepository.existsByKeycloakId(keycloakId);
    }

    @Override
    @Transactional
    public RhAdminProfileResponse updateRhAdminByKeycloakId(String keycloakId, RhAdminCreateRequest request) {
        log.debug("Updating RH Admin profile with keycloakId: {}", keycloakId);

        RhAdminProfile profile = rhAdminProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("RH Admin profile not found with keycloakId: " + keycloakId));

        // Mettre à jour les champs manuellement
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
        profile.setLocation(request.getLocation());
        profile.setDepartment(request.getDepartment());
        profile.updateFullName();
        profile.setUpdatedAt(LocalDateTime.now());

        // Sauvegarder
        RhAdminProfile updatedProfile = rhAdminProfileRepository.save(profile);
        log.info("RH Admin profile updated successfully with keycloakId: {}", keycloakId);

        return enrichProfileWithAuthData(updatedProfile);
    }

    @Override
    @Transactional
    public void deleteRhAdminByKeycloakId(String keycloakId) {
        log.debug("Deleting RH Admin profile with keycloakId: {}", keycloakId);

        RhAdminProfile profile = rhAdminProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("RH Admin profile not found with keycloakId: " + keycloakId));

        rhAdminProfileRepository.delete(profile);
        log.info("RH Admin profile deleted successfully with keycloakId: {}", keycloakId);
    }
}
