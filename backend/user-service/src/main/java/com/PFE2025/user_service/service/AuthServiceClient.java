package com.PFE2025.user_service.service;

import com.PFE2025.user_service.dto.request.PasswordChangeRequest;
import com.PFE2025.user_service.dto.request.RoleUpdateRequest;
import com.PFE2025.user_service.dto.request.StatusUpdateRequest;
import com.PFE2025.user_service.dto.request.UserCreateRequest;
import com.PFE2025.user_service.dto.response.AuthServiceUserDTO;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Client Feign pour communiquer avec l'Auth-Service (WebFlux).
 * Les endpoints correspondent à ceux définis dans l'Auth-Service.
 */
@FeignClient(name = "auth-service", url = "${auth-service.url:http://localhost:7001}")
public interface AuthServiceClient {

    /**
     * Crée un nouvel utilisateur dans Keycloak via Auth-Service.
     * @param request Les informations de l'utilisateur à créer
     * @return Le DTO de l'utilisateur créé
     */
    @PostMapping("/auth/users")
    AuthServiceUserDTO createUser(@RequestBody UserCreateRequest request);

    /**
     * Récupère un utilisateur par son ID Keycloak.
     * @param keycloakId L'ID Keycloak de l'utilisateur
     * @return Le DTO de l'utilisateur
     */
    @GetMapping("/auth/users/{userId}")
    AuthServiceUserDTO getUserById(@PathVariable("userId") String keycloakId);

    /**
     * Met à jour un utilisateur existant.
     * @param keycloakId L'ID Keycloak de l'utilisateur
     * @param request Les nouvelles informations de l'utilisateur
     * @return Le DTO de l'utilisateur mis à jour
     */
    @PutMapping("/auth/users/{userId}")
    AuthServiceUserDTO updateUser(@PathVariable("userId") String keycloakId, @RequestBody UserCreateRequest request);

    /**
     * Supprime un utilisateur.
     * @param keycloakId L'ID Keycloak de l'utilisateur
     */
    @DeleteMapping("/auth/users/{userId}")
    void deleteUser(@PathVariable("userId") String keycloakId);

    /**
     * Récupère les rôles d'un utilisateur.
     * @param keycloakId L'ID Keycloak de l'utilisateur
     * @return La liste des rôles de l'utilisateur
     */
    @GetMapping("/auth/users/{userId}/roles")
    List<String> getUserRoles(@PathVariable("userId") String keycloakId);

    /**
     * Met à jour les rôles d'un utilisateur.
     * @param keycloakId L'ID Keycloak de l'utilisateur
     * @param roles L'ensemble des nouveaux rôles
     * @return Le DTO de l'utilisateur mis à jour
     */
    @PutMapping("/auth/users/{userId}/roles")
    AuthServiceUserDTO updateUserRoles(@PathVariable("userId") String keycloakId, @RequestBody Set<String> roles);

    /**
     * Met à jour le statut d'activation d'un utilisateur.
     * @param keycloakId L'ID Keycloak de l'utilisateur
     * @param statusUpdate Le nouveau statut
     * @return Le DTO de l'utilisateur mis à jour
     */
    @PatchMapping("/auth/users/{userId}/status")
    AuthServiceUserDTO updateUserStatus(@PathVariable("userId") String keycloakId, @RequestBody StatusUpdateRequest statusUpdate);

    /**
     * Réinitialise le mot de passe d'un utilisateur (action admin).
     * @param keycloakId L'ID Keycloak de l'utilisateur
     * @param newPasswordMap Map contenant le nouveau mot de passe
     */
    @PostMapping("/auth/users/{userId}/reset-password")
    void resetPasswordByAdmin(@PathVariable("userId") String keycloakId, @RequestBody Map<String, String> newPasswordMap);

    /**
     * Change le mot de passe de l'utilisateur courant.
     * @param passwordChangeRequest Demande de changement de mot de passe
     * @return ResponseEntity<Void> pour indiquer le succès ou l'échec
     */
    @PostMapping("/auth/me/password")
    ResponseEntity<Void> changePasswordByUser(@RequestBody PasswordChangeRequest passwordChangeRequest);

    /**
     * Récupère les détails de plusieurs utilisateurs en un seul appel.
     * @param keycloakIds Liste des IDs Keycloak à récupérer
     * @return Map où la clé est l'ID Keycloak et la valeur est le DTO utilisateur
     */
    @PostMapping("/auth/users/details-bulk")
    Map<String, AuthServiceUserDTO> getUsersDetailsByIds(@RequestBody List<String> keycloakIds);


}