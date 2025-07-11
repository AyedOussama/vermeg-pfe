package com.pfe2025.application_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DTO pour les demandes de notification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDTO {
    private String type; // EMAIL, PUSH, SMS, etc.
    private String templateKey; // Identifiant du template à utiliser
    private String recipient; // Email ou identifiant du destinataire
    private List<String> cc; // Copie carbone (pour emails)
    private String subject; // Sujet (pour emails)

    @Builder.Default
    private Map<String, Object> parameters = new HashMap<>(); // Paramètres pour template

    private Object data; // Données spécifiques au type de notification
    private Integer priority; // Priorité de la notification (1-5)
    private String sourceService; // Service émetteur
}