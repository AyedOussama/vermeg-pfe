package com.PFE2025.user_service.service;

import com.PFE2025.user_service.dto.request.PasswordChangeRequest;
import com.PFE2025.user_service.dto.request.RoleUpdateRequest;
import com.PFE2025.user_service.dto.request.UserCreateRequest;
import com.PFE2025.user_service.dto.request.UserUpdateRequest;
import com.PFE2025.user_service.dto.response.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service for administrative operations on users.
 */
public interface AdminService {

    /**
     * Creates a new internal user.
     *
     * @param request User creation data
     * @return DTO of the created user
     */
    UserDTO createInternalUser(UserCreateRequest request);

    /**
     * Gets a paginated list of users with optional filtering.
     *
     * @param query Search term (on local fields)
     * @param role Role filter (not directly implemented in this version)
     * @param pageable Pagination information
     * @return Page of user DTOs
     */
    Page<UserDTO> getAllUsers(String query, String role, Pageable pageable);

    /**
     * Gets a user by their local ID.
     *
     * @param id Local ID of the user
     * @return DTO of the found user
     * @throws com.PFE2025.user_service.exception.ResourceNotFoundException if user not found
     */
    UserDTO getUserById(String id);

    /**
     * Updates a user's information.
     *
     * @param id Local ID of the user
     * @param request Data to update
     * @return DTO of the updated user
     * @throws com.PFE2025.user_service.exception.ResourceNotFoundException if user not found
     */
    UserDTO updateUser(String id, UserUpdateRequest request);

    /**
     * Deletes a user (in Keycloak and locally).
     *
     * @param id Local ID of the user
     * @throws com.PFE2025.user_service.exception.ResourceNotFoundException if user not found
     */
    void deleteUser(String id);

    /**
     * Updates a user's status (enabled/disabled) in Keycloak.
     *
     * @param id Local ID of the user
     * @param enabled New status
     * @return DTO of the updated user
     * @throws com.PFE2025.user_service.exception.ResourceNotFoundException if user not found
     */
    UserDTO updateUserStatus(String id, boolean enabled);

    /**
     * Updates a user's roles in Keycloak.
     *
     * @param id Local ID of the user
     * @param request DTO containing the new set of roles
     * @return DTO of the updated user
     * @throws com.PFE2025.user_service.exception.ResourceNotFoundException if user not found
     */
    UserDTO updateUserRoles(String id, RoleUpdateRequest request);

    /**
     * Changes a user's password (administrative action).
     *
     * @param id Local ID of the user
     * @param request DTO containing the new password and confirmation
     * @throws com.PFE2025.user_service.exception.ResourceNotFoundException if user not found
     * @throws IllegalArgumentException if passwords don't match
     */
    void changePassword(String id, PasswordChangeRequest request);

    /**
     * Synchronizes an existing Keycloak user with the user-service.
     * Creates a local user entry if it doesn't exist.
     *
     * @param keycloakId Keycloak ID of the user to synchronize
     * @return DTO of the synchronized user
     * @throws com.PFE2025.user_service.exception.ResourceNotFoundException if user not found in Keycloak
     */
    UserDTO syncKeycloakUser(String keycloakId);
}