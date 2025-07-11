package com.PFE2025.user_service.service.impl;

import com.PFE2025.user_service.dto.request.*;
import com.PFE2025.user_service.dto.response.AuthServiceUserDTO;
import com.PFE2025.user_service.dto.response.UserDTO;

import com.PFE2025.user_service.exception.ResourceAlreadyExistsException;
import com.PFE2025.user_service.exception.ResourceNotFoundException;
import com.PFE2025.user_service.exception.ServiceUnavailableException;
import com.PFE2025.user_service.exception.ValidationException;
import com.PFE2025.user_service.model.User;
import com.PFE2025.user_service.model.UserType; // Assurez-vous que cet import est correct
import com.PFE2025.user_service.repository.UserRepository;
import com.PFE2025.user_service.service.AdminService;
import com.PFE2025.user_service.service.AuthServiceClient;
import com.PFE2025.user_service.util.UserMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;



import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final AuthServiceClient authServiceClient;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserDTO createInternalUser(UserCreateRequest request) {
        log.debug("Creating internal user with email: {}", request.getEmail());

        // Preliminary validation
        validateCreateRequest(request);



        try {
            // 1. Call to auth-service to create the user identity
            AuthServiceUserDTO authUser = authServiceClient.createUser(request);
            log.info("User created in Keycloak with ID: {}", authUser.getUserId());

            // 2. Check if local user already exists (handle potential retries)
            if (userRepository.existsByKeycloakId(authUser.getUserId())) {
                log.warn("Local user with Keycloak ID {} already exists", authUser.getUserId());
                User existingUser = userRepository.findByKeycloakId(authUser.getUserId())
                        .orElseThrow(() -> new IllegalStateException("Inconsistent state: User exists by keycloakId but not found"));
                // Return the existing user combined with potentially updated auth details
                return userMapper.combineUserDTO(existingUser, authUser);
            }

            // 3. Create local user entity
            User localUser = userMapper.localUserFromCreateRequest(request); // Mapper ignore userType
            localUser.setKeycloakId(authUser.getUserId());
            // **** LIGNE CRUCIALE ****
            localUser.setUserType(UserType.INTERNAL); // Définir explicitement le type ENUM
            // *************************

            // 4. Save local user
            log.debug("Attempting to save local user with keycloakId: {} and userType: {}",
                    localUser.getKeycloakId(), localUser.getUserType());
            User savedUser = userRepository.save(localUser); // C'est ici que l'erreur se produit
            log.info("Local user record created successfully with ID: {} for Keycloak ID: {}", savedUser.getId(), authUser.getUserId());

            // 5. Return combined DTO
            return userMapper.combineUserDTO(savedUser, authUser);

        } catch (ResourceAlreadyExistsException e) {
            log.warn("Failed to create user: {} - {}", request.getEmail(), e.getMessage());
            throw e; // Re-throw specific exception
        } catch (Exception e) {
            // Log the original exception causing the DataIntegrityViolationException if possible
            log.error("Error creating user: {}", request.getEmail(), e);
            // Wrap generic exceptions if needed, or re-throw specific ones like DataIntegrityViolationException
            throw e;
        }
    }

    // ... (le reste de la classe AdminServiceImpl reste identique) ...

    private void validateCreateRequest(UserCreateRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ValidationException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ValidationException("Password is required");
        }
        if (request.getFirstName() == null || request.getFirstName().isBlank()) {
            throw new ValidationException("First name is required");
        }
        if (request.getLastName() == null || request.getLastName().isBlank()) {
            throw new ValidationException("Last name is required");
        }
        // Complete username if not provided
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            request.setUsername(request.getEmail());
        }
        // Ne pas valider request.getUserType() ici, car on le force à INTERNAL
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(String query, String role, Pageable pageable) {
        log.debug("Getting all users with query: {}, role: {}, page: {}", query, role, pageable.getPageNumber());
        Page<User> localUsersPage;
        if (query != null && !query.trim().isEmpty()) {
            localUsersPage = userRepository.searchUsers(query.trim(), pageable);
        } else {
            localUsersPage = userRepository.findAll(pageable);
        }

        if (!localUsersPage.hasContent()) {
            return Page.empty(pageable);
        }

        List<String> keycloakIds = localUsersPage.getContent().stream()
                .map(User::getKeycloakId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        Map<String, AuthServiceUserDTO> authDetailsMap = Collections.emptyMap();
        if (!keycloakIds.isEmpty()) {
            try {
                log.debug("Fetching details from auth-service for {} keycloakIds", keycloakIds.size());
                authDetailsMap = authServiceClient.getUsersDetailsByIds(keycloakIds);
                log.info("Successfully fetched details for {} users from auth-service", authDetailsMap.size());
            } catch (Exception e) {
                log.error("Failed to fetch bulk user details from auth-service. Proceeding with local data only. Error: {}", e.getMessage());
                // Ne pas lancer d'exception ici, continuer avec les données locales
            }
        }

        final Map<String, AuthServiceUserDTO> finalAuthDetailsMap = authDetailsMap;
        List<UserDTO> userDTOs = localUsersPage.getContent().stream()
                .map(localUser -> userMapper.combineUserDTO(localUser, finalAuthDetailsMap.get(localUser.getKeycloakId())))
                .filter(Objects::nonNull) // Filtrer si la combinaison échoue
                .collect(Collectors.toList());

        return new PageImpl<>(userDTOs, pageable, localUsersPage.getTotalElements());
    }

    @Override
    // @Cacheable(cacheNames = USER_DETAILS_CACHE, key = "#id") // Temporairement désactivé pour debug
    @Transactional(readOnly = true)
    public UserDTO getUserById(String id) {
        log.debug("Getting user by local id: {}", id);
        User localUser = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("User", id));

        AuthServiceUserDTO authUser = getUserDetailsFromAuthService(localUser.getKeycloakId());
        return userMapper.combineUserDTO(localUser, authUser);
    }

    @CircuitBreaker(name = "auth-service", fallbackMethod = "fallbackGetUserDetails")
    @Retry(name = "auth-service")
    public AuthServiceUserDTO getUserDetailsFromAuthService(String keycloakId) {
        log.debug("Fetching details from auth-service for keycloakId: {}", keycloakId);
        try {
            return authServiceClient.getUserById(keycloakId);
        } catch (Exception e) {
            log.error("Error fetching user details from auth-service for keycloakId {}: {}", keycloakId, e.getMessage());
            // Retourner null ou un DTO vide au lieu de lancer une exception permet
            // à getUserById de fonctionner même si auth-service est en panne (avec des données partielles)
            // throw new ServiceUnavailableException("Failed to fetch user details from auth service for keycloakId " + keycloakId + ": " + e.getMessage());
            return null; // Ou retourner un DTO vide avec un indicateur d'erreur
        }
    }

    /**
     * Méthode fallback pour Circuit Breaker quand auth-service est indisponible
     */
    public AuthServiceUserDTO fallbackGetUserDetails(String keycloakId, Exception ex) {
        log.warn("Circuit breaker activated for auth-service. Using fallback for keycloakId: {}. Error: {}",
                keycloakId, ex.getMessage());
        return null; // Retourne null pour utiliser les données par défaut dans le mapper
    }

    @Override
    @Transactional
    public UserDTO updateUser(String id, UserUpdateRequest request) {
        log.debug("Updating user with local id: {}", id);
        User localUser = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("User", id));

        // Mise à jour des champs locaux
        userMapper.updateLocalUserFromRequest(request, localUser);
        User savedLocalUser = userRepository.save(localUser);
        log.debug("Local user fields updated for id: {}", id);

        // Préparer la requête pour auth-service (uniquement les champs gérés par Keycloak)
        // Important: Ne pas inclure les champs locaux comme phone, department ici.
        // Important: Ne pas inclure le mot de passe ici.
        UserCreateRequest authUpdateRequest = UserCreateRequest.builder()
                .firstName(request.getFirstName()) // Seulement si non null dans la requête
                .lastName(request.getLastName())   // Seulement si non null dans la requête
                .email(request.getEmail())         // Seulement si non null dans la requête
                // Ne pas inclure username sauf si on veut le changer
                // Ne pas inclure enabled/emailVerified sauf si on veut les changer explicitement
                .build();

        // Filtrer les champs null pour ne pas écraser les valeurs existantes dans Keycloak par erreur
        boolean needsAuthUpdate = false;
        if (authUpdateRequest.getFirstName() != null) needsAuthUpdate = true;
        if (authUpdateRequest.getLastName() != null) needsAuthUpdate = true;
        if (authUpdateRequest.getEmail() != null) needsAuthUpdate = true;
        // Ajoutez d'autres champs si nécessaire (username, etc.)

        AuthServiceUserDTO updatedAuthUser = null;
        if(needsAuthUpdate) {
            updatedAuthUser = authServiceClient.updateUser(savedLocalUser.getKeycloakId(), authUpdateRequest);
            log.info("User base details updated in Keycloak via auth-service for keycloakId: {}", savedLocalUser.getKeycloakId());
        } else {
            log.debug("No changes detected for Keycloak fields, skipping update call to auth-service for keycloakId: {}", savedLocalUser.getKeycloakId());
            // Récupérer les données actuelles de Keycloak pour la réponse DTO
            updatedAuthUser = getUserDetailsFromAuthService(savedLocalUser.getKeycloakId());
        }


        UserDTO finalUserDTO = userMapper.combineUserDTO(savedLocalUser, updatedAuthUser);

        return finalUserDTO;
    }

    @Override
    @Transactional
    public void deleteUser(String id) {
        log.debug("Deleting user with local id: {}", id);

        // 1. Find local user first
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("User", id));
        String keycloakId = user.getKeycloakId();

        try {
            // 2. Verify keycloakId is valid
            if (keycloakId == null || keycloakId.isBlank()) {
                log.error("User with local ID {} has no valid keycloakId. Deleting local record only.", id);
                userRepository.delete(user); // Supprimer l'enregistrement local incohérent
                return; // Sortir car on ne peut pas supprimer dans Keycloak
            }

            // 3. Delete user in Keycloak via auth-service
            authServiceClient.deleteUser(keycloakId);
            log.info("User deleted in Keycloak via auth-service for keycloakId: {}", keycloakId);

            // 4. Delete local user
            userRepository.delete(user);
            log.info("Local user record deleted successfully for id: {}", id);

            // 5. Cache clearing no longer needed (cache disabled)

            // 6. User deleted successfully
            log.info("User deletion completed successfully for keycloakId: {}", keycloakId);

        } catch (Exception e) {
            // Si l'erreur vient d'auth-service indiquant que l'utilisateur n'existe pas (déjà supprimé?)
            // OU si l'erreur est une ResourceNotFoundException lancée par notre propre logique
            if (e instanceof ResourceNotFoundException || (e.getCause() instanceof feign.FeignException.NotFound)) {
                log.warn("User keycloakId {} not found in Keycloak (possibly already deleted) but exists locally (id {}). Deleting local record.", keycloakId, id);
                userRepository.delete(user);
                // Cache clearing no longer needed (cache disabled)
                // Ne pas publier d'événement de suppression si l'utilisateur n'existait pas dans Keycloak
                return;
            }

            // For other types of errors, propagate the exception
            log.error("Error deleting user {}: {}", id, e.getMessage(), e);
            // Envisager de ne pas supprimer l'enregistrement local si la suppression Keycloak échoue pour une autre raison
            throw new ServiceUnavailableException("Failed to delete user " + keycloakId + ": " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public UserDTO updateUserStatus(String id, boolean enabled) {
        log.debug("Updating user status for local id: {}, enabled: {}", id, enabled);
        User localUser = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("User", id));
        String keycloakId = localUser.getKeycloakId();
        StatusUpdateRequest statusUpdate = new StatusUpdateRequest(enabled);

        AuthServiceUserDTO updatedAuthUser = authServiceClient.updateUserStatus(keycloakId, statusUpdate);
        log.info("User status updated via auth-service for keycloakId: {}, enabled: {}", keycloakId, enabled);

        // Pas besoin de sauvegarder localUser car le statut n'est pas stocké localement
        // userRepository.save(localUser);

        UserDTO finalUserDTO = userMapper.combineUserDTO(localUser, updatedAuthUser);

        return finalUserDTO;
    }

    @Override
    @Transactional
    public UserDTO updateUserRoles(String id, RoleUpdateRequest request) {
        log.debug("Updating user roles for local id: {}, roles: {}", id, request.getRoles());
        User localUser = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("User", id));
        String keycloakId = localUser.getKeycloakId();

        AuthServiceUserDTO updatedAuthUser = authServiceClient.updateUserRoles(keycloakId, request.getRoles());
        log.info("User roles updated via auth-service for keycloakId: {}", keycloakId);

        // Pas besoin de sauvegarder localUser car les rôles ne sont pas stockés localement
        // userRepository.save(localUser);

        UserDTO finalUserDTO = userMapper.combineUserDTO(localUser, updatedAuthUser);

        return finalUserDTO;
    }

    @Override
    @Transactional
    public void changePassword(String id, PasswordChangeRequest request) {
        log.debug("Admin changing password for user with local id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId("User", id));
        String keycloakId = user.getKeycloakId();

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()){
            throw new ValidationException("New password cannot be empty", "newPassword", null);
        }

        // La vérification de confirmation est souvent faite côté client, mais on peut la garder
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("New password and confirmation password do not match",
                    "confirmPassword", request.getConfirmPassword());
        }

        // Le DTO de auth-service attend password et temporary
        Map<String, String> passwordMap = new HashMap<>();
        passwordMap.put("password", request.getNewPassword());
        passwordMap.put("temporary", "false"); // Admin reset is usually not temporary

        authServiceClient.resetPasswordByAdmin(keycloakId, passwordMap);
        log.info("Admin password reset request sent to auth-service for user: {}", id);
    }

    @Override
    @Transactional
    public UserDTO syncKeycloakUser(String keycloakId) {
        log.debug("Synchronizing Keycloak user with keycloakId: {}", keycloakId);

        try {
            // 1. Récupérer les informations de l'utilisateur depuis Keycloak via auth-service
            AuthServiceUserDTO authUser = authServiceClient.getUserById(keycloakId);
            log.info("User found in Keycloak with ID: {}", authUser.getUserId());

            // 2. Vérifier si l'utilisateur existe déjà localement
            Optional<User> existingUser = userRepository.findByKeycloakId(keycloakId);
            if (existingUser.isPresent()) {
                log.info("Local user with Keycloak ID {} already exists, returning existing user", keycloakId);
                return userMapper.combineUserDTO(existingUser.get(), authUser);
            }

            // 3. Créer un nouvel utilisateur local
            User localUser = User.builder()
                    .keycloakId(keycloakId)
                    .userType(UserType.INTERNAL) // Par défaut, les utilisateurs synchronisés sont INTERNAL
                    .build();

            // 4. Sauvegarder l'utilisateur local
            User savedUser = userRepository.save(localUser);
            log.info("Local user record created successfully with ID: {} for Keycloak ID: {}",
                    savedUser.getId(), keycloakId);

            // 5. Retourner le DTO combiné
            return userMapper.combineUserDTO(savedUser, authUser);

        } catch (Exception e) {
            log.error("Error synchronizing Keycloak user with keycloakId {}: {}", keycloakId, e.getMessage());
            throw new ResourceNotFoundException("User not found in Keycloak with keycloakId: " + keycloakId);
        }
    }

    // --- Utility Methods ---


}
