package com.PFE2025.user_service.dto.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO pour recevoir les événements CV_PARSED depuis ai-processing-service.
 * Structure identique à celle du ai-processing-service pour compatibilité.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CvParsedEventDto {
    
    // === IDENTIFIANTS ===
    private String keycloakId; // ID Keycloak du candidat
    private Long documentId; // ID du document CV original
    private String eventType; // Type d'événement
    
    // === DONNÉES EXTRAITES PAR L'IA ===
    private PersonalInfo personalInfo;
    private List<String> skills;
    private List<Experience> experiences;
    private List<Education> educationHistory;
    private List<Certification> certifications;
    private List<LanguageProficiency> languages;
    private String seniorityLevel;
    private Integer yearsOfExperience;
    private String profileSummary;
    private String cvLanguage;
    
    // === ANALYSE ATS ===
    private AtsAnalysis atsAnalysis;
    
    // === MÉTADONNÉES ===
    private AiProcessingMetadata aiMetadata;
    
    // === CLASSES INTERNES ===
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PersonalInfo {
        private String firstName;
        private String lastName;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Experience {
        private String company;
        private String position;
        private String startDate;
        private String endDate;
        private String description;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Education {
        private String degree;
        private String institution;
        private String field;
        private String year;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Certification {
        private String name;
        private String issuer;
        private String date;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LanguageProficiency {
        private String language;
        private String proficiency;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AtsAnalysis {
        private Integer overallScore;
        private String overallAssessment;
        private List<String> strengths;
        private List<String> weaknesses;
        private List<String> recommendations;
        private ScoreBreakdown scoreBreakdown;
        private String atsCompatibility;
        private List<String> missingKeywords;
        private String improvementPriority;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ScoreBreakdown {
        private Integer formatScore;
        private Integer contentScore;
        private Integer skillsScore;
        private Integer experienceScore;
        private String scoreExplanation;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AiProcessingMetadata {
        private String documentId;
        private String modelUsed;
        private LocalDateTime processedAt;
        private String detectedLanguage;
    }
}
