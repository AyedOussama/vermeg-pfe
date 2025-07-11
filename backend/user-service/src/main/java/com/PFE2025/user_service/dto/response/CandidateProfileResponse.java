package com.PFE2025.user_service.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * DTO de réponse pour le profil complet d'un candidat.
 * Utilisé par l'endpoint /profile/me pour les candidats.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Profil complet d'un candidat")
public class CandidateProfileResponse {
    
    // === IDENTIFIANTS ===
    
    @Schema(description = "ID MongoDB du profil")
    private String id;
    
    @Schema(description = "ID Keycloak de l'utilisateur")
    private String keycloakId;
    
    // === DONNÉES PERSONNELLES DE BASE ===
    
    @Schema(description = "Prénom")
    private String firstName;
    
    @Schema(description = "Nom de famille")
    private String lastName;
    
    @Schema(description = "Nom complet (prénom + nom)")
    private String fullName;
    
    @Schema(description = "Adresse email")
    private String email;
    
    @Schema(description = "Rôles utilisateur")
    private Set<String> roles;
    
    @Schema(description = "Type d'utilisateur")
    private String userType;
    
    @Schema(description = "Statut du compte")
    private String status;
    
    // === DONNÉES PERSONNELLES ÉTENDUES ===
    
    @Schema(description = "Localisation/Ville")
    private String location;
    
    @Schema(description = "Numéro de téléphone")
    private String phone;
    
    @Schema(description = "URL du profil LinkedIn")
    private String linkedinUrl;
    
    @Schema(description = "URL du portfolio personnel")
    private String portfolioUrl;
    
    @Schema(description = "Date de naissance")
    private String dateOfBirth;
    
    @Schema(description = "Catégories professionnelles préférées")
    private List<String> preferredCategories;
    
    @Schema(description = "URL ou chemin de la photo de profil")
    private String photo;
    
    @Schema(description = "ID du document CV uploadé")
    private Long documentCVId;
    
    // === DONNÉES EXTRAITES PAR L'IA ===
    
    @Schema(description = "Compétences techniques et soft skills")
    private List<String> skills;
    
    @Schema(description = "Expériences professionnelles")
    private List<ExperienceDto> experiences;
    
    @Schema(description = "Formation académique")
    private List<EducationDto> educationHistory;
    
    @Schema(description = "Certifications professionnelles")
    private List<CertificationDto> certifications;
    
    @Schema(description = "Langues parlées")
    private List<LanguageProficiencyDto> languages;
    
    @Schema(description = "Niveau de séniorité estimé")
    private String seniorityLevel;
    
    @Schema(description = "Années d'expérience estimées")
    private Integer yearsOfExperience;
    
    @Schema(description = "Résumé professionnel généré par l'IA")
    private String profileSummary;
    
    @Schema(description = "Langue principale du CV")
    private String cvLanguage;
    
    // === ANALYSE ATS ===
    
    @Schema(description = "Score global ATS sur 100")
    private Integer overallScore;
    
    @Schema(description = "Évaluation générale du CV")
    private String overallAssessment;
    
    @Schema(description = "Points forts identifiés")
    private List<String> strengths;
    
    @Schema(description = "Points faibles identifiés")
    private List<String> weaknesses;
    
    @Schema(description = "Recommandations d'amélioration")
    private List<String> recommendations;
    
    @Schema(description = "Niveau de compatibilité ATS")
    private String atsCompatibility;
    
    @Schema(description = "Mots-clés manquants suggérés")
    private List<String> missingKeywords;
    
    @Schema(description = "Priorité d'amélioration")
    private String improvementPriority;
    
    @Schema(description = "Score format et structure (/20)")
    private Integer formatScore;
    
    @Schema(description = "Score contenu et pertinence (/30)")
    private Integer contentScore;
    
    @Schema(description = "Score compétences (/25)")
    private Integer skillsScore;
    
    @Schema(description = "Score expérience (/25)")
    private Integer experienceScore;
    
    @Schema(description = "Explication détaillée du scoring")
    private String scoreExplanation;
    
    // === MÉTADONNÉES ===
    
    @Schema(description = "Date de création du profil")
    private LocalDateTime createdAt;
    
    @Schema(description = "Date de dernière mise à jour")
    private LocalDateTime updatedAt;
    
    @Schema(description = "Date de traitement du CV par l'IA")
    private LocalDateTime cvProcessedAt;
    
    @Schema(description = "Modèle IA utilisé pour l'analyse")
    private String aiModelUsed;
    
    @Schema(description = "Langue détectée par Tika")
    private String cvDetectedLanguage;
    
    // === CLASSES INTERNES POUR STRUCTURES COMPLEXES ===
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Expérience professionnelle")
    public static class ExperienceDto {
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
    @Schema(description = "Formation académique")
    public static class EducationDto {
        private String degree;
        private String institution;
        private String field;
        private String year;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Certification professionnelle")
    public static class CertificationDto {
        private String name;
        private String issuer;
        private String date;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Compétence linguistique")
    public static class LanguageProficiencyDto {
        private String language;
        private String proficiency;
    }
    
    // === MÉTHODES UTILITAIRES ===
    
    /**
     * Indique si le profil a été enrichi par l'IA
     */
    public boolean isEnrichedByAi() {
        return cvProcessedAt != null && (skills != null || experiences != null || overallScore != null);
    }
    
    /**
     * Indique si un CV a été uploadé
     */
    public boolean hasCvUploaded() {
        return documentCVId != null;
    }
}
