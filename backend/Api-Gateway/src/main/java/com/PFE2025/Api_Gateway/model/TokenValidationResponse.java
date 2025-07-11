package com.PFE2025.Api_Gateway.model;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationResponse {
    private boolean valid;
    private String userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private List<String> roles;
    private Long expiresIn;
}
