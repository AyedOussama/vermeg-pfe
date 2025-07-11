package com.PFE2025.user_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Utilisateur tel que retourné par l'Auth-Service")
public class AuthServiceUserDTO {
    @Schema(description = "ID Keycloak de l'utilisateur")
    @JsonProperty("userId")  // Mapper le champ userId du JSON
    private String userId;

    @Schema(description = "Email")
    private String email;

    @Schema(description = "Prénom")
    private String firstName;

    @Schema(description = "Nom de famille")
    private String lastName;

    @Schema(description = "Nom complet")
    private String fullName;

    @Schema(description = "Indique si le compte est actif")
    private boolean enabled;

    @Schema(description = "Rôles de l'utilisateur")
    private Set<String> roles;
}