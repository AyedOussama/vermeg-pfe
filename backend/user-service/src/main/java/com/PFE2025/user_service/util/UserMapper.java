package com.PFE2025.user_service.util;

import com.PFE2025.user_service.dto.request.CandidateRegistrationRequest;
import com.PFE2025.user_service.dto.request.UserCreateRequest;
import com.PFE2025.user_service.dto.request.UserUpdateRequest;
import com.PFE2025.user_service.dto.response.AuthServiceUserDTO;
import com.PFE2025.user_service.dto.response.UserDTO;
import com.PFE2025.user_service.dto.response.UserRegistrationResponse;

import com.PFE2025.user_service.model.User;
import org.mapstruct.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;


@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        imports = {LocalDateTime.class, Collections.class, HashSet.class}
)
public interface UserMapper {

    // --- Entity Mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "keycloakId", ignore = true)
    @Mapping(target = "userType", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User localUserFromCreateRequest(UserCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "keycloakId", ignore = true)
    @Mapping(target = "department", constant = "N/A")
    @Mapping(target = "userType", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User localUserFromRegistrationRequest(CandidateRegistrationRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "keycloakId", ignore = true)
    @Mapping(target = "userType", ignore = true)

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateLocalUserFromRequest(UserUpdateRequest request, @MappingTarget User user);

    // --- DTO Mappings ---

    @Mapping(target = "username", ignore = true)
    @Mapping(target = "firstName", ignore = true)
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "fullName", ignore = true)
    @Mapping(target = "userType", expression = "java(user.getUserType().name())")
    UserDTO mapLocalUserToUserDTO(User user);

    /**
     * Convertit un User en UserDTO (version simplifiée pour ProfileService)
     */
    @Mapping(target = "userType", expression = "java(user.getUserType().name())")
    UserDTO toUserDTO(User user);

    @Mapping(target = "firstName", ignore = true)
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "enabled", ignore = true)

    UserRegistrationResponse toUserRegistrationResponse(User user);

    // --- Request Mappings ---

    @Mapping(target = "roles", expression = "java(request.getRoles() != null ? request.getRoles() : new HashSet<>())")
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "emailVerified", constant = "true")
    UserCreateRequest userCreateRequestFromRegistration(CandidateRegistrationRequest request);



    // --- Combination methods ---

    default UserDTO combineUserDTO(User localUser, AuthServiceUserDTO authUser) {
        if (localUser == null) {
            return null;
        }

        UserDTO dto = mapLocalUserToUserDTO(localUser);

        if (authUser != null) {
            dto.setKeycloakId(authUser.getUserId());
            // Utiliser fullName au lieu de username
            String fullName = authUser.getFullName() != null ? authUser.getFullName() : buildFullName(authUser.getFirstName(), authUser.getLastName());
            dto.setUsername(fullName); // Afficher fullName dans le champ username
            dto.setFirstName(authUser.getFirstName());
            dto.setLastName(authUser.getLastName());
            dto.setEmail(authUser.getEmail());
            dto.setRoles(authUser.getRoles());
            dto.setEnabled(authUser.isEnabled());
            dto.setFullName(fullName);
        } else {
            dto.setUsername("[Auth Service Unavailable]");
            dto.setFirstName("[N/A]");
            dto.setLastName("[N/A]");
            dto.setEmail("[N/A]");
            dto.setRoles(Collections.emptySet());
            dto.setEnabled(false);
            dto.setFullName("[N/A]");
        }

        return dto;
    }

    default UserRegistrationResponse combineRegistrationResponse(User localUser, AuthServiceUserDTO authUser) {
        if (localUser == null) {
            return null;
        }

        UserRegistrationResponse response = toUserRegistrationResponse(localUser);

        if (authUser != null) {
            response.setKeycloakId(authUser.getUserId());
            response.setFirstName(authUser.getFirstName());
            response.setLastName(authUser.getLastName());
            response.setEmail(authUser.getEmail());
            response.setRoles(authUser.getRoles());
            response.setEnabled(authUser.isEnabled());
        } else {
            response.setFirstName("[N/A]");
            response.setLastName("[N/A]");
            response.setEmail("[N/A]");
            response.setRoles(Collections.emptySet());
            response.setEnabled(false);
        }

        return response;
    }

    default String buildFullName(String firstName, String lastName) {
        StringBuilder sb = new StringBuilder();
        if (firstName != null && !firstName.isBlank()) {
            sb.append(firstName);
        }
        if (lastName != null && !lastName.isBlank()) {
            if (!sb.isEmpty()) {
                sb.append(" ");
            }
            sb.append(lastName);
        }
        return !sb.isEmpty() ? sb.toString() : null;
    }
}