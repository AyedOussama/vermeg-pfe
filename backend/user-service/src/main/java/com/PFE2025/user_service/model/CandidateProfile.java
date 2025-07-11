package com.PFE2025.user_service.model;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entité représentant le profil complet d'un candidat.
 * Contient toutes les données personnelles, professionnelles et d'analyse IA.
 * Utilisée uniquement pour les utilisateurs de type CANDIDATE.
 */
@Document(collection = "candidate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CandidateProfile extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    private String keycloakId; // Lien avec l'utilisateur Keycloak

    // === DONNÉES PERSONNELLES ÉTENDUES (saisies à l'inscription) ===
    
    private String firstName;
    private String lastName;
    @Indexed
    private String email;
    @Indexed
    private String location;
    private String phone;
    private String linkedinUrl;
    private String portfolioUrl;
    private String dateOfBirth; // Format string pour flexibilité
    private List<String> preferredCategories;
    private String photo; // URL ou chemin vers la photo (vide initialement)
    private Long documentCVId; // ID du document CV uploadé
    
    // === DONNÉES EXTRAITES PAR L'IA (depuis CV_PARSED) ===
    
    // Compétences et informations professionnelles
    private List<String> skills;
    private List<Experience> experiences;
    private List<Education> educationHistory;
    private List<Certification> certifications;
    private List<LanguageProficiency> languages;
    
    // Analyse de carrière par l'IA
    @Indexed
    private String seniorityLevel; // "Junior", "Mid-level", "Senior"
    private Integer yearsOfExperience;
    private String profileSummary; // Résumé professionnel généré par l'IA
    private String cvLanguage; // Langue détectée du CV ("fr", "en", etc.)
    
    // === ANALYSE ATS COMPLÈTE ===
    
    // Scores et évaluation globale
    private Integer overallScore; // Score global sur 100
    private String overallAssessment; // Évaluation générale du CV
    private List<String> strengths; // Points forts identifiés
    private List<String> weaknesses; // Points faibles identifiés
    private List<String> recommendations; // Recommandations d'amélioration
    private String atsCompatibility; // "EXCELLENT", "GOOD", "FAIR", "POOR"
    private List<String> missingKeywords; // Mots-clés manquants suggérés
    private String improvementPriority; // "HIGH", "MEDIUM", "LOW"
    
    // Détail des scores par catégorie
    private Integer formatScore; // Score format et structure (/20)
    private Integer contentScore; // Score contenu et pertinence (/30)
    private Integer skillsScore; // Score compétences (/25)
    private Integer experienceScore; // Score expérience (/25)
    private String scoreExplanation; // Explication détaillée du scoring
    
    // === MÉTADONNÉES DE TRAITEMENT IA ===
    private LocalDateTime cvProcessedAt; // Date de traitement du CV par l'IA
    private String aiModelUsed; // Modèle IA utilisé pour l'analyse
    private String cvDetectedLanguage; // Langue détectée par Tika
    
    // === CLASSES INTERNES POUR STRUCTURES COMPLEXES ===
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Experience {
        private String company;
        private String position;
        private String startDate; // Format string pour flexibilité
        private String endDate;
        private String description;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Education {
        private String degree;
        private String institution;
        private String field;
        private String year; // Format string (peut être une période)
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Certification {
        private String name;
        private String issuer;
        private String date; // Format string
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LanguageProficiency {
        private String language;
        private String proficiency; // "Natif", "Courant", "Basique", etc.
    }
    
    // === MÉTHODES UTILITAIRES ===
    
    /**
     * Génère le nom complet à partir du prénom et nom
     */
    public String getFullName() {
        if (firstName == null && lastName == null) {
            return null;
        }
        if (firstName == null) {
            return lastName;
        }
        if (lastName == null) {
            return firstName;
        }
        return firstName + " " + lastName;
    }
    
    /**
     * Vérifie si le profil a été enrichi par l'IA
     */
    public boolean isEnrichedByAi() {
        return cvProcessedAt != null && (skills != null || experiences != null || overallScore != null);
    }
    
    /**
     * Vérifie si le CV a été uploadé
     */
    public boolean hasCvUploaded() {
        return documentCVId != null;
    }
}
