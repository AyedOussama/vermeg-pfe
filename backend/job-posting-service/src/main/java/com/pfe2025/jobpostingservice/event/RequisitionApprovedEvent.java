package com.pfe2025.jobpostingservice.event;



import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Événement émis lorsqu'une réquisition est approuvée.
 * Contenu de cet événement permet la création automatique d'une offre d'emploi.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequisitionApprovedEvent implements Serializable {

    private Long requisitionId;

    private String title;

    private String description;

    private String department;

    private String projectName;

    private String projectLeaderId;

    private String projectLeaderName;

    private String requiredLevel;

    private Set<String> requiredSkills;

    private Integer minExperience;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expectedStartDate;

    private Boolean isUrgent;

    private Integer neededHeadcount;

    private String approvedBy;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime approvedAt;

    private String eventId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private String eventType;
}
