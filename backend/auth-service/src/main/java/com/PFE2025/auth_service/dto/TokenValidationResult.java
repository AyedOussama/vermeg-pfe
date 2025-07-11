package com.PFE2025.auth_service.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TokenValidationResult {
    private boolean valid;
    private String userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;  // ✅ Ajout du fullName
    private List<String> roles;
    private Long expiresIn;

    // Constructeur par défaut requis pour Jackson
    public TokenValidationResult() {}

    // Constructeur avec tous les paramètres pour Jackson
    @JsonCreator
    public TokenValidationResult(
            @JsonProperty("valid") boolean valid,
            @JsonProperty("userId") String userId,
            @JsonProperty("username") String username,
            @JsonProperty("email") String email,
            @JsonProperty("firstName") String firstName,
            @JsonProperty("lastName") String lastName,
            @JsonProperty("fullName") String fullName,
            @JsonProperty("roles") List<String> roles,
            @JsonProperty("expiresIn") Long expiresIn) {
        this.valid = valid;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.roles = roles;
        this.expiresIn = expiresIn;
    }

    public String getFullName() {
        if (fullName != null && !fullName.isEmpty()) {
            return fullName;
        }
        return (firstName != null ? firstName : "") +
                (lastName != null ? " " + lastName : "").trim();
    }

    public static TokenValidationResult invalid() {
        return TokenValidationResult.builder()
                .valid(false)
                .build();
    }
}