package com.pfe2025.ai_processing_service.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO pour l'événement CV_PARSED publié après traitement réussi.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // Ignorer les champs inconnus lors du parsing JSON de l'IA
public class CvParsedEventDto {
    // Identifiants clés
    private String keycloakId; // ID Keycloak du candidat
    private Long documentId; // ID du document CV original
    @Builder.Default
    private String eventType = "CV_PARSED"; // Type d'événement

    // Champs extraits par l'IA
    private PersonalInfo personalInfo;
    private List<String> skills;
    private List<Experience> experiences;
    private List<Education> educationHistory;
    private List<Certification> certifications;
    private List<LanguageProficiency> languages;
    private String seniorityLevel; // Niveau estimé (junior, mid, senior...)
    private Integer yearsOfExperience; // Années d'expérience estimées
    private String profileSummary; // Résumé généré
    private String cvLanguage; // Langue principale détectée dans le CV (ex: "fr", "en")

    // === NOUVEAUX CHAMPS D'ANALYSE ATS ===
    private AtsAnalysis atsAnalysis; // Analyse complète du CV par le système ATS

    // Métadonnées ajoutées par ce service
    private AiProcessingMetadata aiMetadata;

    // --- Classes internes pour la structure JSON ---
    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PersonalInfo {
        private String firstName;
        private String lastName;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Experience {
        private String company;
        private String position;
        private String startDate; // Garder en String pour flexibilité de format IA
        private String endDate;   // Garder en String
        private String description;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Education {
        private String degree;
        private String institution;
        private String field;
        private String year; // Garder en String (peut être une période)
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Certification {
        private String name;
        private String issuer;
        private String date; // Garder en String
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LanguageProficiency {
        private String language;
        private String proficiency; // (ex: "Natif", "Courant", "Basique")
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AiProcessingMetadata {
        private String documentId; // Rappel de l'ID
        private String modelUsed; // Modèle IA utilisé
        private LocalDateTime processedAt; // Timestamp du traitement
        private String detectedLanguage; // Langue détectée par Tika (avant appel IA)
        // Ajouter d'autres métadonnées utiles (ex: durée du traitement)
    }

    // === NOUVELLE CLASSE POUR L'ANALYSE ATS ===
    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AtsAnalysis {
        private Integer overallScore; // Score global sur 100
        private String overallAssessment; // Évaluation générale du CV
        private List<String> strengths; // Points forts identifiés
        private List<String> weaknesses; // Points faibles identifiés
        private List<String> recommendations; // Recommandations d'amélioration
        private ScoreBreakdown scoreBreakdown; // Détail des scores par catégorie
        private String atsCompatibility; // Niveau de compatibilité ATS (EXCELLENT, GOOD, FAIR, POOR)
        private List<String> missingKeywords; // Mots-clés manquants suggérés
        private String improvementPriority; // Priorité d'amélioration (HIGH, MEDIUM, LOW)
    }

    // Détail des scores par catégorie
    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ScoreBreakdown {
        private Integer formatScore; // Score format et structure (sur 20)
        private Integer contentScore; // Score contenu et pertinence (sur 30)
        private Integer skillsScore; // Score compétences (sur 25)
        private Integer experienceScore; // Score expérience (sur 25)
        private String scoreExplanation; // Explication du scoring
    }
}
