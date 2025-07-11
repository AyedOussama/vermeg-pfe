package com.PFE2025.auth_service.service;

import com.PFE2025.auth_service.config.KeycloakConfig;
import com.PFE2025.auth_service.dto.UserCreateRequest;
import com.PFE2025.auth_service.dto.UserDTO;
import com.PFE2025.auth_service.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.AccessTokenResponse;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakService {

    private final Keycloak keycloakAdminClient;
    private final KeycloakConfig keycloakConfig;
    private final WebClient.Builder webClientBuilder;

    /**
     * Authenticate user and get tokens
     */
    public Mono<AccessTokenResponse> authenticate(String email, String password) {
        String tokenUrl = String.format("%s/realms/%s/protocol/openid-connect/token",
                keycloakConfig.getAuthServerUrl(), keycloakConfig.getRealm());

        return webClientBuilder.build()
                .post()
                .uri(tokenUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("grant_type", "password")
                        .with("client_id", keycloakConfig.getResource())
                        .with("client_secret", keycloakConfig.getCredentials().getSecret())
                        .with("username", email)
                        .with("password", password))
                .retrieve()
                .bodyToMono(AccessTokenResponse.class)
                .doOnSuccess(response -> log.info("User authenticated successfully: {}", email))
                .onErrorMap(WebClientResponseException.class, e -> {
                    log.error("Authentication failed for {}: {}", email, e.getMessage());
                    if (e.getStatusCode().value() == 401) {
                        return new InvalidCredentialsException("Invalid email or password");
                    }
                    return new KeycloakException("Authentication failed: " + e.getMessage());
                });
    }

    /**
     * Refresh access token
     */
    public Mono<AccessTokenResponse> refreshToken(String refreshToken) {
        String tokenUrl = String.format("%s/realms/%s/protocol/openid-connect/token",
                keycloakConfig.getAuthServerUrl(), keycloakConfig.getRealm());

        return webClientBuilder.build()
                .post()
                .uri(tokenUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("grant_type", "refresh_token")
                        .with("client_id", keycloakConfig.getResource())
                        .with("client_secret", keycloakConfig.getCredentials().getSecret())
                        .with("refresh_token", refreshToken))
                .retrieve()
                .bodyToMono(AccessTokenResponse.class)
                .doOnSuccess(response -> log.debug("Token refreshed successfully"))
                .onErrorMap(WebClientResponseException.class, e -> {
                    log.error("Token refresh failed: {}", e.getMessage());
                    if (e.getStatusCode().value() == 400) {
                        return new InvalidCredentialsException("Refresh token expired or invalid");
                    }
                    return new KeycloakException("Token refresh failed: " + e.getMessage());
                });
    }

    /**
     * Logout user
     */
    public Mono<Void> logout(String refreshToken) {
        String logoutUrl = String.format("%s/realms/%s/protocol/openid-connect/logout",
                keycloakConfig.getAuthServerUrl(), keycloakConfig.getRealm());

        return webClientBuilder.build()
                .post()
                .uri(logoutUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("client_id", keycloakConfig.getResource())
                        .with("client_secret", keycloakConfig.getCredentials().getSecret())
                        .with("refresh_token", refreshToken))
                .retrieve()
                .toBodilessEntity()
                .doOnSuccess(response -> log.debug("User logged out successfully"))
                .then()
                .onErrorResume(e -> {
                    log.warn("Logout error (treating as success): {}", e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Get user by email
     */
    public Mono<UserDTO> getUserByEmail(String email) {
        return Mono.fromCallable(() -> {
                    RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
                    List<UserRepresentation> users = realmResource.users().searchByEmail(email, true);

                    if (users.isEmpty()) {
                        throw new ResourceNotFoundException("User not found with email: " + email);
                    }

                    return mapToUserDTO(users.get(0));
                })
                .subscribeOn(Schedulers.boundedElastic())
                .doOnSuccess(user -> log.debug("User found by email: {}", email))
                .doOnError(e -> log.error("Error finding user by email {}: {}", email, e.getMessage()));
    }

    /**
     * Get user by ID
     */
    public Mono<UserDTO> getUserById(String id) {
        return Mono.fromCallable(() -> {
                    RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
                    try {
                        UserRepresentation user = realmResource.users().get(id).toRepresentation();
                        return mapToUserDTO(user);
                    } catch (NotFoundException e) {
                        throw new ResourceNotFoundException("User not found with id: " + id);
                    }
                })
                .subscribeOn(Schedulers.boundedElastic())
                .doOnSuccess(user -> log.debug("User found by id: {}", id))
                .doOnError(e -> log.error("Error finding user by id {}: {}", id, e.getMessage()));
    }

    /**
     * Create new user
     */
    public Mono<UserDTO> createUser(UserCreateRequest request) {
        return Mono.fromCallable(() -> {
                    RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());

                    // Check if user already exists
                    List<UserRepresentation> existingUsers = realmResource.users().searchByEmail(request.getEmail(), true);
                    if (!existingUsers.isEmpty()) {
                        throw new UserAlreadyExistsException("User already exists with email: " + request.getEmail());
                    }

                    // Create user representation
                    UserRepresentation user = new UserRepresentation();
                    user.setUsername(request.getEmail()); // Username = Email
                    user.setEmail(request.getEmail());
                    user.setFirstName(request.getFirstName());
                    user.setLastName(request.getLastName());
                    user.setEnabled(request.isEnabled());
                    user.setEmailVerified(request.isEmailVerified());

                    // Set credentials
                    if (request.getPassword() != null) {
                        CredentialRepresentation credential = new CredentialRepresentation();
                        credential.setType(CredentialRepresentation.PASSWORD);
                        credential.setValue(request.getPassword());
                        credential.setTemporary(false);
                        user.setCredentials(Collections.singletonList(credential));
                    }

                    // Create user
                    UsersResource usersResource = realmResource.users();
                    try (Response response = usersResource.create(user)) {
                        if (response.getStatus() != 201) {
                            throw new KeycloakException("Failed to create user: " + response.getStatusInfo());
                        }

                        // Get created user ID
                        String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

                        // Assign roles
                        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
                            assignRolesToUser(userId, request.getRoles());
                        }

                        // Return created user
                        return getUserById(userId).block();
                    }
                })
                .subscribeOn(Schedulers.boundedElastic())
                .doOnSuccess(user -> log.info("User created successfully: {}", user.getEmail()))
                .doOnError(e -> log.error("Error creating user: {}", e.getMessage()));
    }

    /**
     * Update user
     */
    public Mono<UserDTO> updateUser(String id, UserCreateRequest request) {
        return Mono.fromCallable(() -> {
                    RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
                    UserResource userResource = realmResource.users().get(id);

                    try {
                        UserRepresentation user = userResource.toRepresentation();

                        // Update fields
                        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
                        if (request.getLastName() != null) user.setLastName(request.getLastName());
                        if (request.getEmail() != null) {
                            user.setEmail(request.getEmail());
                            user.setUsername(request.getEmail()); // Keep username = email
                        }

                        // Update user
                        userResource.update(user);

                        // Update password if provided
                        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                            CredentialRepresentation credential = new CredentialRepresentation();
                            credential.setType(CredentialRepresentation.PASSWORD);
                            credential.setValue(request.getPassword());
                            credential.setTemporary(false);
                            userResource.resetPassword(credential);
                        }

                        // Update roles if provided
                        if (request.getRoles() != null) {
                            updateUserRoles(id, request.getRoles()).block();
                        }

                        return mapToUserDTO(userResource.toRepresentation());
                    } catch (NotFoundException e) {
                        throw new ResourceNotFoundException("User not found with id: " + id);
                    }
                })
                .subscribeOn(Schedulers.boundedElastic())
                .doOnSuccess(user -> log.info("User updated successfully: {}", id))
                .doOnError(e -> log.error("Error updating user {}: {}", id, e.getMessage()));
    }

    /**
     * Delete user
     */
    public Mono<Void> deleteUser(String id) {
        return Mono.fromRunnable(() -> {
                    RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
                    try {
                        realmResource.users().delete(id);
                        log.info("User deleted successfully: {}", id);
                    } catch (NotFoundException e) {
                        throw new ResourceNotFoundException("User not found with id: " + id);
                    }
                })
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    /**
     * Change user password
     */
    public Mono<Void> changePassword(String userId, String oldPassword, String newPassword) {
        return getUserById(userId)
                .flatMap(user -> authenticate(user.getEmail(), oldPassword))
                .flatMap(tokens -> Mono.fromRunnable(() -> {
                            RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
                            UserResource userResource = realmResource.users().get(userId);

                            CredentialRepresentation credential = new CredentialRepresentation();
                            credential.setType(CredentialRepresentation.PASSWORD);
                            credential.setValue(newPassword);
                            credential.setTemporary(false);

                            userResource.resetPassword(credential);
                            log.info("Password changed successfully for user: {}", userId);
                        })
                        .subscribeOn(Schedulers.boundedElastic()))
                .then();
    }

    /**
     * Reset password (admin action)
     */
    public Mono<Void> resetPassword(String userId, String newPassword) {
        return Mono.fromRunnable(() -> {
                    RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
                    UserResource userResource = realmResource.users().get(userId);

                    try {
                        CredentialRepresentation credential = new CredentialRepresentation();
                        credential.setType(CredentialRepresentation.PASSWORD);
                        credential.setValue(newPassword);
                        credential.setTemporary(false);

                        userResource.resetPassword(credential);
                        log.info("Password reset successfully for user: {}", userId);
                    } catch (NotFoundException e) {
                        throw new ResourceNotFoundException("User not found with id: " + userId);
                    }
                })
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    /**
     * Get all users with pagination
     */
    public Mono<List<UserDTO>> getAllUsers(int page, int size) {
        return Mono.fromCallable(() -> {
                    RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
                    List<UserRepresentation> users = realmResource.users()
                            .list(page * size, size);

                    return users.stream()
                            .map(this::mapToUserDTO)
                            .collect(Collectors.toList());
                })
                .subscribeOn(Schedulers.boundedElastic())
                .doOnSuccess(users -> log.debug("Retrieved {} users", users.size()));
    }

    /**
     * Update user status
     */
    public Mono<UserDTO> updateUserStatus(String id, boolean enabled) {
        return Mono.fromCallable(() -> {
                    RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
                    UserResource userResource = realmResource.users().get(id);

                    try {
                        UserRepresentation user = userResource.toRepresentation();
                        user.setEnabled(enabled);
                        userResource.update(user);

                        log.info("User status updated: {} - enabled: {}", id, enabled);
                        return mapToUserDTO(userResource.toRepresentation());
                    } catch (NotFoundException e) {
                        throw new ResourceNotFoundException("User not found with id: " + id);
                    }
                })
                .subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Update user roles
     */
    public Mono<UserDTO> updateUserRoles(String id, Set<String> newRoles) {
        return Mono.fromCallable(() -> {
                    RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
                    UserResource userResource = realmResource.users().get(id);

                    try {
                        // Get current roles
                        List<RoleRepresentation> currentRoles = userResource.roles().realmLevel().listEffective();

                        // Remove all current roles
                        userResource.roles().realmLevel().remove(currentRoles);

                        // Add new roles
                        if (newRoles != null && !newRoles.isEmpty()) {
                            assignRolesToUser(id, newRoles);
                        }

                        log.info("User roles updated: {} - new roles: {}", id, newRoles);
                        return mapToUserDTO(userResource.toRepresentation());
                    } catch (NotFoundException e) {
                        throw new ResourceNotFoundException("User not found with id: " + id);
                    }
                })
                .subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Search users by email pattern
     */
    public Mono<List<UserDTO>> searchUsersByEmail(String emailPattern) {
        return Mono.fromCallable(() -> {
                    RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
                    List<UserRepresentation> users = realmResource.users()
                            .search(emailPattern, 0, 50);

                    return users.stream()
                            .map(this::mapToUserDTO)
                            .collect(Collectors.toList());
                })
                .subscribeOn(Schedulers.boundedElastic());
    }

    // Helper methods

    private void assignRolesToUser(String userId, Set<String> roleNames) {
        RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
        UserResource userResource = realmResource.users().get(userId);

        List<RoleRepresentation> rolesToAdd = realmResource.roles().list().stream()
                .filter(role -> roleNames.contains(role.getName()))
                .collect(Collectors.toList());

        if (!rolesToAdd.isEmpty()) {
            userResource.roles().realmLevel().add(rolesToAdd);
            log.debug("Assigned {} roles to user {}", rolesToAdd.size(), userId);
        }
    }

    private UserDTO mapToUserDTO(UserRepresentation user) {
        // Définir les rôles métier autorisés
        Set<String> allowedBusinessRoles = Set.of("CEO", "PROJECT_LEADER", "RH_ADMIN", "CANDIDATE");

        Set<String> roles = new HashSet<>();
        try {
            RealmResource realmResource = keycloakAdminClient.realm(keycloakConfig.getRealm());
            roles = realmResource.users().get(user.getId()).roles().realmLevel().listEffective()
                    .stream()
                    .map(RoleRepresentation::getName)
                    .filter(allowedBusinessRoles::contains) // ✅ Filtrer seulement les rôles métier
                    .collect(Collectors.toSet());

            log.debug("Filtered business roles for user {}: {}", user.getId(), roles);
        } catch (Exception e) {
            log.warn("Failed to fetch roles for user {}: {}", user.getId(), e.getMessage());
        }

        // Construire le fullName avec espacement correct
        StringBuilder fullNameBuilder = new StringBuilder();
        if (user.getFirstName() != null && !user.getFirstName().trim().isEmpty()) {
            fullNameBuilder.append(user.getFirstName().trim());
        }
        if (user.getLastName() != null && !user.getLastName().trim().isEmpty()) {
            if (fullNameBuilder.length() > 0) {
                fullNameBuilder.append(" ");
            }
            fullNameBuilder.append(user.getLastName().trim());
        }
        String fullName = fullNameBuilder.toString();

        return UserDTO.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName)
                .enabled(user.isEnabled())
                .roles(roles)
                .build();
    }
}