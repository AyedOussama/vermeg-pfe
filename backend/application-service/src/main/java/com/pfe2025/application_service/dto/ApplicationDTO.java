package com.pfe2025.application_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.pfe2025.application_service.model.Application.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * DTOs pour les candidatures.
 */
public class ApplicationDTO {

    /**
     * DTO pour la création d'une candidature.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "L'ID de l'offre d'emploi est obligatoire")
        private Long jobPostingId;

        private Long resumeDocumentId;

        private Long coverLetterDocumentId;



        @Size(max = 1000, message = "Le message ne doit pas dépasser 1000 caractères")
        private String candidateMessage;
    }

    /**
     * DTO pour la réponse après création d'une candidature.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateResponse {
        private String reference;
        private Long id;
        private ApplicationStatus status;
        private LocalDateTime submittedAt;
    }

    /**
     * DTO pour la mise à jour d'une candidature.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private Long coverLetterDocumentId;


        @Size(max = 1000, message = "Le message ne doit pas dépasser 1000 caractères")
        private String candidateMessage;
    }

    /**
     * DTO pour le retrait d'une candidature.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WithdrawRequest {
        @NotNull(message = "La raison est obligatoire")
        @Size(min = 10, max = 500, message = "La raison doit contenir entre 10 et 500 caractères")
        private String reason;
    }

    /**
     * DTO pour la prise de décision.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DecisionRequest {
        @NotNull(message = "Le statut est obligatoire")
        private ApplicationStatus newStatus;

        @Size(max = 1000, message = "Les notes ne doivent pas dépasser 1000 caractères")
        private String recruiterNotes;

        private Boolean sendNotification;
    }

    /**
     * DTO pour la vue détaillée d'une candidature.
     */
    @Data
    @EqualsAndHashCode(callSuper = true)
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DetailResponse extends BaseAuditDTO {
        private String reference;
        private String candidateId;
        private String candidateName;
        private Long jobPostingId;
        private String jobTitle;
        private String jobDepartment;
        private ApplicationStatus status;
        private DocumentDTO resume;
        private DocumentDTO coverLetter;
        private String candidateMessage;
        private String recruiterNotes;
        private Boolean aiProcessed;
        private Double aiScore;
        private Boolean autoDecision;
        private EvaluationDTO evaluation;
        private LocalDateTime submittedAt;
        private LocalDateTime processedAt;
        private LocalDateTime lastStatusChangedAt;
        private String lastStatusChangedBy;
        private Long interviewId;
        private LocalDateTime interviewRequestedAt;
        private List<StatusHistoryDTO> statusHistory;
    }

    /**
     * DTO pour la vue résumée d'une candidature.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SummaryResponse {
        private Long id;
        private String reference;
        private String candidateName;
        private String jobTitle;
        private Long jobPostingId;
        private ApplicationStatus status;
        private Double aiScore;
        private Boolean aiProcessed;
        private LocalDateTime submittedAt;
        private LocalDateTime lastStatusChangedAt;
    }

    /**
     * DTO pour la vue candidat d'une candidature.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CandidateView {
        private Long id;
        private String reference;
        private String jobTitle;
        private String jobDepartment;
        private ApplicationStatus status;
        private LocalDateTime submittedAt;
        private LocalDateTime lastStatusChangedAt;
        private List<DocumentDTO> documents;
        private List<StatusHistoryDTO> statusHistory;
        private InterviewDetailDTO interviewDetails;
        private String feedbackMessage;
    }

    /**
     * DTO pour la vue tableau de bord d'une candidature.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardView {
        private Long id;
        private String reference;
        private String candidateName;
        private String jobTitle;
        private ApplicationStatus status;
        private Double aiScore;
        private String aiRecommendation;
        private LocalDateTime submittedAt;
        private Long daysInCurrentStatus;
        private Boolean hasDocuments;
    }

    /**
     * DTO pour le résumé du tableau de bord.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummary {
        private Integer totalApplications;
        private Integer pendingApplications;
        private Integer shortlistedApplications;
        private Integer rejectedApplications;
        private List<DashboardAlert> alerts;
        private List<ApplicationsByJob> topJobs;
    }

    /**
     * DTO pour alerte du tableau de bord.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardAlert {
        private String type; // INFO, WARNING, CRITICAL
        private String message;
        private String recommendation;
    }

    /**
     * DTO pour le regroupement des candidatures par poste.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationsByJob {
        private Long jobId;
        private String jobTitle;
        private Integer applicationCount;
        private Double averageScore;
    }

    /**
     * DTO pour les statistiques d'un poste.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobPostingStatsDTO {
        private Long jobId;
        private String jobTitle;
        private Integer totalApplications;
        private Map<String, Integer> statusCounts;
        private Double averageScore;
        private Double conversionRate;
        private Integer averageTimeToProcess;
        private List<String> topSkillsGaps;
    }
}
