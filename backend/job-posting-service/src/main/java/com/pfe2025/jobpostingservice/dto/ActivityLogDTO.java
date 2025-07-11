package com.pfe2025.jobpostingservice.dto;



import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * DTO pour les journaux d'activité.
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Entrée du journal d'activité")
public class ActivityLogDTO {

    @Schema(description = "Identifiant unique")
    private Long id;

    @Schema(description = "Identifiant de l'offre d'emploi associée")
    private Long jobPostId;

    @Schema(description = "Identifiant de l'utilisateur")
    private String userId;

    @Schema(description = "Nom de l'utilisateur")
    private String userName;

    @Schema(description = "Action effectuée")
    private String action;

    @Schema(description = "Détails de l'action")
    private String details;

    @Schema(description = "Date et heure de l'action")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
}
