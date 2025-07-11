package com.pfe2025.jobpostingservice.event;



import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Événement émis lorsqu'une candidature est soumise.
 * Permet la mise à jour des métriques de l'offre d'emploi.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationSubmittedEvent implements Serializable {

    private Long applicationId;

    private Long jobPostId;

    private String candidateId;

    private String candidateName;

    private String resumeUrl;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime submittedAt;

    private String eventId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private String eventType;
}
