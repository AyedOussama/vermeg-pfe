package com.PFE2025.user_service.service.fallback;

import com.PFE2025.user_service.dto.request.PasswordChangeRequest;
import com.PFE2025.user_service.dto.request.StatusUpdateRequest;
import com.PFE2025.user_service.dto.request.UserCreateRequest;
import com.PFE2025.user_service.dto.response.AuthServiceUserDTO;
import com.PFE2025.user_service.exception.ServiceUnavailableException;
import com.PFE2025.user_service.service.AuthServiceClient;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cloud.openfeign.FallbackFactory;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Factory for creating fallback instances for AuthServiceClient.
 * Logs the original error and throws a ServiceUnavailableException or returns
 * an appropriate error/empty response to indicate the remote service is unavailable.
 */
@Component
@Slf4j
public class AuthServiceFallbackFactory implements FallbackFactory<AuthServiceClient> {

    @Override
    public AuthServiceClient create(Throwable cause) {
        String message = cause.getMessage();
        log.error("Fallback triggered for auth-service client: {}", message, cause);

        return new AuthServiceClient() {

            @Override
            public AuthServiceUserDTO createUser(UserCreateRequest request) {
                log.error("Fallback: Failed to create user in auth-service: {}", request.getEmail());
                throw new ServiceUnavailableException("Unable to create user: Auth service is unavailable");
            }

            @Override
            public AuthServiceUserDTO getUserById(String keycloakId) {
                log.error("Fallback: Failed to get user from auth-service: {}", keycloakId);
                throw new ServiceUnavailableException("Unable to retrieve user details: Auth service is unavailable");
            }

            @Override
            public AuthServiceUserDTO updateUser(String keycloakId, UserCreateRequest request) {
                log.error("Fallback: Failed to update user in auth-service: {}", keycloakId);
                throw new ServiceUnavailableException("Unable to update user: Auth service is unavailable");
            }

            @Override
            public void deleteUser(String keycloakId) {
                log.error("Fallback: Failed to delete user from auth-service: {}", keycloakId);
                throw new ServiceUnavailableException("Unable to delete user: Auth service is unavailable");
            }

            @Override
            public List<String> getUserRoles(String keycloakId) {
                log.error("Fallback: Failed to get roles from auth-service: {}", keycloakId);
                // Return an empty list rather than throwing an exception
                return Collections.emptyList();
            }

            @Override
            public AuthServiceUserDTO updateUserRoles(String keycloakId, Set<String> roles) {
                log.error("Fallback: Failed to update roles in auth-service for user: {}", keycloakId);
                throw new ServiceUnavailableException("Unable to update user roles: Auth service is unavailable");
            }

            @Override
            public AuthServiceUserDTO updateUserStatus(String keycloakId, StatusUpdateRequest statusUpdate) {
                log.error("Fallback: Failed to update status in auth-service for user: {}", keycloakId);
                throw new ServiceUnavailableException("Unable to update user status: Auth service is unavailable");
            }

            @Override
            public void resetPasswordByAdmin(String keycloakId, Map<String, String> newPasswordMap) {
                log.error("Fallback: Failed to reset password in auth-service for user: {}", keycloakId);
                throw new ServiceUnavailableException("Unable to reset password: Auth service is unavailable");
            }

            @Override
            public ResponseEntity<Void> changePasswordByUser(PasswordChangeRequest request) {
                log.error("Fallback: Failed to change password in auth-service");
                throw new ServiceUnavailableException("Unable to change password: Auth service is unavailable");
            }

            @Override
            public Map<String, AuthServiceUserDTO> getUsersDetailsByIds(List<String> keycloakIds) {
                log.error("Fallback: Failed to get bulk user details from auth-service for {} ids", keycloakIds.size());
                // Return an empty map rather than throwing an exception
                return Collections.emptyMap();
            }




        };
    }
}