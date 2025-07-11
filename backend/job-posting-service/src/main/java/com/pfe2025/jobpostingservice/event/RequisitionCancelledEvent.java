package com.pfe2025.jobpostingservice.event;



import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Événement émis lorsqu'une réquisition est annulée.
 * Permet la fermeture automatique des offres d'emploi liées.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequisitionCancelledEvent implements Serializable {

    private Long requisitionId;

    private String title;

    private String cancelledBy;

    private String reason;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime cancelledAt;

    private String eventId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private String eventType;
}
