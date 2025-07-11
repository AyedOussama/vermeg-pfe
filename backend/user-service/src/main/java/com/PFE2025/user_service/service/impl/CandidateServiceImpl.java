package com.PFE2025.user_service.service.impl;

import com.PFE2025.user_service.dto.request.PasswordChangeRequest;
import com.PFE2025.user_service.dto.request.UserCreateRequest;
import com.PFE2025.user_service.dto.request.CandidateRegistrationRequest;
import com.PFE2025.user_service.dto.response.CandidateProfileResponse;
import com.PFE2025.user_service.dto.response.AuthServiceUserDTO;
import com.PFE2025.user_service.dto.response.UserRegistrationResponse;

import com.PFE2025.user_service.exception.*;
import com.PFE2025.user_service.model.CandidateProfile;
import com.PFE2025.user_service.model.User;
import com.PFE2025.user_service.model.UserType;
import com.PFE2025.user_service.repository.CandidateProfileRepository;
import com.PFE2025.user_service.repository.UserRepository;
import com.PFE2025.user_service.service.AuthServiceClient;
import com.PFE2025.user_service.service.CandidateService;
import com.PFE2025.user_service.service.DocumentServiceClient;
import com.PFE2025.user_service.util.CandidateProfileMapper;
import com.PFE2025.user_service.util.UserMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateServiceImpl implements CandidateService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final AuthServiceClient authServiceClient;
    private final DocumentServiceClient documentServiceClient;
    private final UserMapper userMapper;
    private final CandidateProfileMapper candidateProfileMapper;

    @Override
    @Transactional
    public UserRegistrationResponse registerCandidate(CandidateRegistrationRequest request) {
        log.info("🚀 DÉBUT INSCRIPTION CANDIDAT - Email: {}", request.getEmail());

        // Validate request
        validateRegistrationRequest(request);

        try {
            // === ÉTAPE 1 : CRÉER COMPTE KEYCLOAK D'ABORD ===
            log.info("📝 ÉTAPE 1 - Création compte Keycloak pour: {}", request.getEmail());

            UserCreateRequest createRequest = userMapper.userCreateRequestFromRegistration(request);
            Set<String> roles = new HashSet<>();
            roles.add("CANDIDATE");
            createRequest.setRoles(roles);
            createRequest.setEnabled(true);
            createRequest.setEmailVerified(true);

            if (createRequest.getUsername() == null || createRequest.getUsername().isEmpty()) {
                createRequest.setUsername(createRequest.getEmail());
            }

            AuthServiceUserDTO authUser = authServiceClient.createUser(createRequest);
            String keycloakId = authUser.getUserId();
            log.info("✅ KEYCLOAK CRÉÉ - ID: {} pour email: {}", keycloakId, request.getEmail());

            // === ÉTAPE 2 : UPLOAD CV AVEC KEYCLOAK ID ===
            log.info("📄 ÉTAPE 2 - Upload CV pour keycloakId: {}", keycloakId);

            Long documentCVId = documentServiceClient.uploadCV(request.getCvFile(), keycloakId)
                    .doOnSuccess(docId -> log.info("✅ CV UPLOADÉ - DocumentId: {} pour keycloakId: {}", docId, keycloakId))
                    .doOnError(error -> log.error("❌ ERREUR UPLOAD CV - keycloakId: {} - {}", keycloakId, error.getMessage()))
                    .block(); // Conversion en synchrone pour la transaction

            if (documentCVId == null) {
                throw new RuntimeException("Failed to upload CV for keycloakId: " + keycloakId);
            }

            // === ÉTAPE 3 : VÉRIFIER SI PROFIL EXISTE DÉJÀ ===
            if (candidateProfileRepository.existsByKeycloakId(keycloakId)) {
                log.warn("⚠️ PROFIL EXISTANT - keycloakId: {} existe déjà", keycloakId);
                // Créer User basique si nécessaire pour compatibilité
                if (!userRepository.existsByKeycloakId(keycloakId)) {
                    User basicUser = User.builder()
                            .keycloakId(keycloakId)
                            .phone(request.getPhone())
                            .userType(UserType.CANDIDATE)
                            .build();
                    userRepository.save(basicUser);
                }
                User existingUser = userRepository.findByKeycloakId(keycloakId)
                        .orElseThrow(() -> new IllegalStateException("Inconsistent state"));
                return userMapper.combineRegistrationResponse(existingUser, authUser);
            }

            // === ÉTAPE 4 : CRÉER USER BASIQUE (COMPATIBILITÉ) ===
            log.info("👤 ÉTAPE 4 - Création User basique pour keycloakId: {}", keycloakId);

            User localUser = userMapper.localUserFromRegistrationRequest(request);
            localUser.setKeycloakId(keycloakId);
            localUser.setUserType(UserType.CANDIDATE);
            User savedUser = userRepository.save(localUser);
            log.info("✅ USER BASIQUE CRÉÉ - ID: {} pour keycloakId: {}", savedUser.getId(), keycloakId);

            // === ÉTAPE 5 : CRÉER PROFIL CANDIDAT COMPLET ===
            log.info("📋 ÉTAPE 5 - Création profil candidat complet pour keycloakId: {}", keycloakId);

            CandidateProfile candidateProfile = candidateProfileMapper.fromRegistrationRequest(request);
            candidateProfile.setKeycloakId(keycloakId);
            candidateProfile.setFirstName(request.getFirstName());
            candidateProfile.setLastName(request.getLastName());
            candidateProfile.setEmail(request.getEmail());
            candidateProfile.setDocumentCVId(documentCVId); // Ajouter l'ID du CV uploadé

            CandidateProfile savedProfile = candidateProfileRepository.save(candidateProfile);
            log.info("✅ PROFIL CANDIDAT CRÉÉ - ID: {} pour keycloakId: {} avec CV: {}",
                    savedProfile.getId(), keycloakId, documentCVId);

            // === ÉTAPE 6 : INSCRIPTION TERMINÉE ===
            log.info("🎉 INSCRIPTION TERMINÉE - keycloakId: {}, profileId: {}, documentId: {}",
                    keycloakId, savedProfile.getId(), documentCVId);

            return userMapper.combineRegistrationResponse(savedUser, authUser);

        } catch (ResourceAlreadyExistsException e) {
            log.warn("❌ INSCRIPTION ÉCHOUÉE - Email déjà utilisé: {}", request.getEmail());
            throw e;
        } catch (Exception e) {
            log.error("❌ ERREUR INSCRIPTION - Email: {} - {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to register candidate: " + e.getMessage(), e);
        }
    }

    private void validateRegistrationRequest(CandidateRegistrationRequest request) {
        // Validation des champs de base
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ValidationException("Email is required", "email", null);
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ValidationException("Password is required", "password", null);
        }

        if (request.getFirstName() == null || request.getFirstName().isBlank()) {
            throw new ValidationException("First name is required", "firstName", null);
        }

        if (request.getLastName() == null || request.getLastName().isBlank()) {
            throw new ValidationException("Last name is required", "lastName", null);
        }

        // Validation des nouveaux champs obligatoires
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            throw new ValidationException("Phone number is required", "phone", null);
        }

        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new ValidationException("Location is required", "location", null);
        }

        if (request.getDateOfBirth() == null || request.getDateOfBirth().isBlank()) {
            throw new ValidationException("Date of birth is required", "dateOfBirth", null);
        }

        if (request.getPreferredCategories() == null || request.getPreferredCategories().isEmpty()) {
            throw new ValidationException("At least one preferred category is required", "preferredCategories", null);
        }

        // Validation du fichier CV
        if (request.getCvFile() == null || request.getCvFile().isEmpty()) {
            throw new ValidationException("CV file is required", "cvFile", null);
        }

        // Validation du type de fichier CV (PDF uniquement)
        String contentType = request.getCvFile().getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new ValidationException("CV file must be a PDF", "cvFile", contentType);
        }

        // Validation de la taille du fichier (max 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (request.getCvFile().getSize() > maxSize) {
            throw new ValidationException("CV file size must not exceed 10MB", "cvFile", request.getCvFile().getSize());
        }
    }

    @Override
    @Transactional
    public void changePassword(String username_unused, PasswordChangeRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof Jwt)) {
            throw new AuthenticationFailedException("User not authenticated or authentication principal is not a JWT");
        }

        Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
        String keycloakId = jwtPrincipal.getSubject();

        log.debug("Attempting password change for authenticated user with keycloakId: {}", keycloakId);

        // Validate password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("New password and confirmation password do not match",
                    "confirmPassword", request.getConfirmPassword());
        }

        try {
            // The Feign call requires that the user's JWT token is propagated (via FeignConfig)
            authServiceClient.changePasswordByUser(request);
            log.info("Password change request sent successfully for user: {}", keycloakId);
        } catch (Exception e) {
            log.error("Error calling auth-service for password change for user {}: {}", keycloakId, e.getMessage());
            throw new ServiceUnavailableException("Failed to request password change: " + e.getMessage());
        }
    }

    /**
     * Récupère un candidat par son keycloakId
     */
    @Override
    @Transactional(readOnly = true)
    public CandidateProfileResponse getCandidateByKeycloakId(String keycloakId) {
        log.debug("Getting candidate profile by keycloakId: {}", keycloakId);

        CandidateProfile profile = candidateProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for keycloakId: " + keycloakId));

        return candidateProfileMapper.toResponse(profile);
    }

    /**
     * Récupère tous les candidats avec pagination
     */
    @Override
    @Transactional(readOnly = true)
    public Page<CandidateProfileResponse> getAllCandidates(Pageable pageable) {
        log.debug("Getting all candidate profiles with pagination: {}", pageable);

        Page<CandidateProfile> profiles = candidateProfileRepository.findAll(pageable);
        return profiles.map(candidateProfileMapper::toResponse);
    }

    /**
     * Recherche des candidats par mot-clé
     */
    @Transactional(readOnly = true)
    public Page<CandidateProfileResponse> searchCandidates(String keyword, Pageable pageable) {
        log.debug("Searching candidate profiles with keyword: {}", keyword);

        Page<CandidateProfile> profiles = candidateProfileRepository.searchByKeyword(keyword, pageable);
        return profiles.map(candidateProfileMapper::toResponse);
    }

    /**
     * Récupère les candidats par localisation
     */
    @Transactional(readOnly = true)
    public Page<CandidateProfileResponse> getCandidatesByLocation(String location, Pageable pageable) {
        log.debug("Getting candidate profiles by location: {}", location);

        Page<CandidateProfile> profiles = candidateProfileRepository.findByLocationContainingIgnoreCase(location, pageable);
        return profiles.map(candidateProfileMapper::toResponse);
    }

    /**
     * Récupère les candidats par niveau de séniorité
     */
    @Transactional(readOnly = true)
    public Page<CandidateProfileResponse> getCandidatesByExperienceLevel(String experienceLevel, Pageable pageable) {
        log.debug("Getting candidate profiles by seniority level: {}", experienceLevel);

        Page<CandidateProfile> profiles = candidateProfileRepository.findBySeniorityLevelContainingIgnoreCase(experienceLevel, pageable);
        return profiles.map(candidateProfileMapper::toResponse);
    }

    /**
     * Récupère un candidat par son ID
     */
    @Transactional(readOnly = true)
    public CandidateProfileResponse getCandidateById(String id) {
        log.debug("Getting candidate profile by id: {}", id);

        CandidateProfile profile = candidateProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found with id: " + id));

        return candidateProfileMapper.toResponse(profile);
    }

    /**
     * Compte le nombre total de candidats
     */
    @Transactional(readOnly = true)
    public long countCandidates() {
        log.debug("Counting total candidate profiles");
        return candidateProfileRepository.count();
    }
}