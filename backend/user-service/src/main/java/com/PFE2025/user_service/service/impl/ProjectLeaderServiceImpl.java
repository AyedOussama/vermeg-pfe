package com.PFE2025.user_service.service.impl;

import com.PFE2025.user_service.dto.request.ProjectLeaderCreateRequest;
import com.PFE2025.user_service.dto.request.ProjectLeaderUpdateRequest;
import com.PFE2025.user_service.dto.request.UserCreateRequest;
import com.PFE2025.user_service.dto.response.AuthServiceUserDTO;
import com.PFE2025.user_service.dto.response.ProjectLeaderProfileResponse;
import com.PFE2025.user_service.exception.ResourceAlreadyExistsException;
import com.PFE2025.user_service.exception.ResourceNotFoundException;
import com.PFE2025.user_service.model.ProjectLeaderProfile;
import com.PFE2025.user_service.model.User;
import com.PFE2025.user_service.model.UserType;
import com.PFE2025.user_service.repository.ProjectLeaderProfileRepository;
import com.PFE2025.user_service.repository.UserRepository;
import com.PFE2025.user_service.service.AuthServiceClient;
import com.PFE2025.user_service.service.ProjectLeaderService;
import com.PFE2025.user_service.util.ProjectLeaderProfileMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implémentation du service ProjectLeaderService.
 * Gère toutes les opérations CRUD et la logique métier pour les Project Leaders.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectLeaderServiceImpl implements ProjectLeaderService {

    private final ProjectLeaderProfileRepository projectLeaderProfileRepository;
    private final UserRepository userRepository;
    private final AuthServiceClient authServiceClient;
    private final ProjectLeaderProfileMapper projectLeaderProfileMapper;

    @Override
    @Transactional
    public ProjectLeaderProfileResponse createProjectLeader(ProjectLeaderCreateRequest request) {
        log.info("🚀 DÉBUT CRÉATION PROJECT LEADER - Email: {}", request.getEmail());

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

            UserCreateRequest userCreateRequest = projectLeaderProfileMapper.toUserCreateRequest(request);
            AuthServiceUserDTO authUser = authServiceClient.createUser(userCreateRequest);
            String keycloakId = authUser.getUserId();
            
            log.info("✅ KEYCLOAK CRÉÉ - ID: {} pour email: {}", keycloakId, request.getEmail());

            // === ÉTAPE 2 : VÉRIFIER SI PROFIL EXISTE DÉJÀ ===
            if (projectLeaderProfileRepository.existsByKeycloakId(keycloakId)) {
                log.warn("⚠️ PROFIL PROJECT LEADER EXISTANT - keycloakId: {} existe déjà", keycloakId);
                ProjectLeaderProfile existingProfile = projectLeaderProfileRepository.findByKeycloakId(keycloakId)
                        .orElseThrow(() -> new IllegalStateException("Inconsistent state"));
                return projectLeaderProfileMapper.enrichWithAuthData(existingProfile, authUser);
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

            // === ÉTAPE 4 : CRÉER PROFIL PROJECT LEADER COMPLET ===
            log.info("📋 ÉTAPE 4 - Création profil Project Leader complet pour keycloakId: {}", keycloakId);

            ProjectLeaderProfile profile = projectLeaderProfileMapper.fromCreateRequest(request);
            profile.setKeycloakId(keycloakId);
            profile.updateFullName();

            ProjectLeaderProfile savedProfile = projectLeaderProfileRepository.save(profile);
            log.info("✅ PROFIL PROJECT LEADER CRÉÉ - ID: {} pour keycloakId: {}", 
                    savedProfile.getId(), keycloakId);

            // === ÉTAPE 5 : CRÉATION TERMINÉE ===
            log.info("🎉 CRÉATION PROJECT LEADER TERMINÉE - keycloakId: {}, profileId: {}", 
                    keycloakId, savedProfile.getId());

            return projectLeaderProfileMapper.enrichWithAuthData(savedProfile, authUser);

        } catch (ResourceAlreadyExistsException e) {
            log.warn("❌ CRÉATION ÉCHOUÉE - Email déjà utilisé: {}", request.getEmail());
            throw e;
        } catch (Exception e) {
            log.error("❌ ERREUR CRÉATION PROJECT LEADER - Email: {} - {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to create Project Leader: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectLeaderProfileResponse getProjectLeaderById(String id) {
        log.debug("Getting Project Leader profile by id: {}", id);
        
        ProjectLeaderProfile profile = projectLeaderProfileRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("ProjectLeaderProfile", id));

        return enrichProfileWithAuthData(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectLeaderProfileResponse getProjectLeaderByKeycloakId(String keycloakId) {
        log.debug("Getting Project Leader profile by keycloakId: {}", keycloakId);
        
        ProjectLeaderProfile profile = projectLeaderProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectLeaderProfile not found for keycloakId: " + keycloakId));

        return enrichProfileWithAuthData(profile);
    }

    @Override
    @Transactional
    public ProjectLeaderProfileResponse updateProjectLeader(String id, ProjectLeaderUpdateRequest request) {
        log.debug("Updating Project Leader profile with id: {}", id);

        ProjectLeaderProfile profile = projectLeaderProfileRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("ProjectLeaderProfile", id));

        // Mettre à jour les champs du profil
        projectLeaderProfileMapper.updateFromRequest(request, profile);
        profile.updateFullName();

        ProjectLeaderProfile savedProfile = projectLeaderProfileRepository.save(profile);
        log.info("✅ PROFIL PROJECT LEADER MIS À JOUR - ID: {}", savedProfile.getId());

        return enrichProfileWithAuthData(savedProfile);
    }

    @Override
    @Transactional
    public void deleteProjectLeader(String id) {
        log.debug("Deleting Project Leader profile with id: {}", id);

        ProjectLeaderProfile profile = projectLeaderProfileRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("ProjectLeaderProfile", id));

        String keycloakId = profile.getKeycloakId();

        try {
            // Supprimer le profil Project Leader
            projectLeaderProfileRepository.delete(profile);
            log.info("✅ PROFIL PROJECT LEADER SUPPRIMÉ - ID: {}", id);

            // Supprimer l'utilisateur de base si il existe
            userRepository.findByKeycloakId(keycloakId).ifPresent(user -> {
                userRepository.delete(user);
                log.info("✅ USER BASIQUE SUPPRIMÉ pour keycloakId: {}", keycloakId);
            });

            // Supprimer le compte Keycloak
            authServiceClient.deleteUser(keycloakId);
            log.info("✅ COMPTE KEYCLOAK SUPPRIMÉ - ID: {}", keycloakId);

        } catch (Exception e) {
            log.error("❌ ERREUR SUPPRESSION PROJECT LEADER - ID: {} - {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete Project Leader: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectLeaderProfileResponse> getAllProjectLeaders(Pageable pageable) {
        log.debug("Getting all Project Leaders with pagination: {}", pageable);
        
        Page<ProjectLeaderProfile> profiles = projectLeaderProfileRepository.findAll(pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectLeaderProfileResponse> searchProjectLeaders(String keyword, Pageable pageable) {
        log.debug("Searching Project Leaders with keyword: {} and pagination: {}", keyword, pageable);
        
        Page<ProjectLeaderProfile> profiles = projectLeaderProfileRepository.searchByKeyword(keyword, pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    // === MÉTHODES UTILITAIRES PRIVÉES ===

    private void validateCreateRequest(ProjectLeaderCreateRequest request) {
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

    private ProjectLeaderProfileResponse enrichProfileWithAuthData(ProjectLeaderProfile profile) {
        try {
            AuthServiceUserDTO authUser = authServiceClient.getUserById(profile.getKeycloakId());
            return projectLeaderProfileMapper.enrichWithAuthData(profile, authUser);
        } catch (Exception e) {
            log.warn("Failed to fetch auth data for keycloakId: {}, returning profile without auth data", 
                    profile.getKeycloakId());
            return projectLeaderProfileMapper.toResponse(profile);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectLeaderProfileResponse> getProjectLeadersByDepartment(String department, Pageable pageable) {
        log.debug("Getting Project Leaders by department: {} with pagination: {}", department, pageable);

        Page<ProjectLeaderProfile> profiles = projectLeaderProfileRepository.findByDepartmentContainingIgnoreCase(department, pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectLeaderProfileResponse> getProjectLeadersByManagementLevel(String managementLevel, Pageable pageable) {
        log.debug("Getting Project Leaders by management level: {} with pagination: {}", managementLevel, pageable);

        try {
            ProjectLeaderProfile.ManagementLevel level = ProjectLeaderProfile.ManagementLevel.valueOf(managementLevel.toUpperCase());
            Page<ProjectLeaderProfile> profiles = projectLeaderProfileRepository.findByManagementLevel(level, pageable);
            return profiles.map(this::enrichProfileWithAuthData);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid management level: {}", managementLevel);
            return Page.empty(pageable);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectLeaderProfileResponse> getProjectLeadersByLocation(String location, Pageable pageable) {
        log.debug("Getting Project Leaders by location: {} with pagination: {}", location, pageable);

        Page<ProjectLeaderProfile> profiles = projectLeaderProfileRepository.findByLocationContainingIgnoreCase(location, pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectLeaderProfileResponse> getProjectLeadersByMinExperience(Integer minExperience, Pageable pageable) {
        log.debug("Getting Project Leaders by min experience: {} with pagination: {}", minExperience, pageable);

        Page<ProjectLeaderProfile> profiles = projectLeaderProfileRepository.findByYearsOfExperienceGreaterThanEqual(minExperience, pageable);
        return profiles.map(this::enrichProfileWithAuthData);
    }

    @Override
    @Transactional(readOnly = true)
    public long countProjectLeaders() {
        return projectLeaderProfileRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public long countProjectLeadersByDepartment(String department) {
        return projectLeaderProfileRepository.countByDepartmentContainingIgnoreCase(department);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByKeycloakId(String keycloakId) {
        return projectLeaderProfileRepository.existsByKeycloakId(keycloakId);
    }

    @Override
    @Transactional
    public ProjectLeaderProfileResponse updateProjectLeaderByKeycloakId(String keycloakId, ProjectLeaderCreateRequest request) {
        log.debug("Updating Project Leader profile with keycloakId: {}", keycloakId);

        ProjectLeaderProfile profile = projectLeaderProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("Project Leader profile not found with keycloakId: " + keycloakId));

        // Mettre à jour les champs manuellement
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
        profile.setLocation(request.getLocation());
        profile.setDepartment(request.getDepartment());
        profile.setManagementLevel(request.getManagementLevel());
        profile.setYearsOfExperience(request.getYearsOfExperience());
        profile.updateFullName();

        // Sauvegarder
        ProjectLeaderProfile updatedProfile = projectLeaderProfileRepository.save(profile);
        log.info("Project Leader profile updated successfully with keycloakId: {}", keycloakId);

        return enrichProfileWithAuthData(updatedProfile);
    }

    @Override
    @Transactional
    public void deleteProjectLeaderByKeycloakId(String keycloakId) {
        log.debug("Deleting Project Leader profile with keycloakId: {}", keycloakId);

        ProjectLeaderProfile profile = projectLeaderProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("Project Leader profile not found with keycloakId: " + keycloakId));

        projectLeaderProfileRepository.delete(profile);
        log.info("Project Leader profile deleted successfully with keycloakId: {}", keycloakId);
    }
}
