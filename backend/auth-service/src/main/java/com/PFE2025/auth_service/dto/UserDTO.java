package com.PFE2025.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;  // ✅ Ajout du fullName
    private boolean enabled;
    private Set<String> roles;

    // Méthode helper pour construire le fullName si non fourni
    public String getFullName() {
        if (fullName != null && !fullName.isEmpty()) {
            return fullName;
        }
        // Construire automatiquement si non défini avec espacement correct
        StringBuilder fullNameBuilder = new StringBuilder();
        if (firstName != null && !firstName.trim().isEmpty()) {
            fullNameBuilder.append(firstName.trim());
        }
        if (lastName != null && !lastName.trim().isEmpty()) {
            if (fullNameBuilder.length() > 0) {
                fullNameBuilder.append(" ");
            }
            fullNameBuilder.append(lastName.trim());
        }
        return fullNameBuilder.toString();
    }
}