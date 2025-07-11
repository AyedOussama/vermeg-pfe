package com.PFE2025.user_service.util;

import com.PFE2025.user_service.dto.request.CandidateRegistrationRequest;
import com.PFE2025.user_service.dto.response.CandidateProfileResponse;
import com.PFE2025.user_service.model.CandidateProfile;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour les entités et DTOs liés aux profils candidats.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CandidateProfileMapper {
    
    // === MAPPINGS DEPUIS CANDIDATEREGISTRATIONREQUEST ===
    
    /**
     * Crée un CandidateProfile depuis une demande d'inscription
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "keycloakId", ignore = true)
    @Mapping(target = "photo", constant = "") // Photo vide initialement
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    // Tous les champs IA sont null initialement
    @Mapping(target = "skills", ignore = true)
    @Mapping(target = "experiences", ignore = true)
    @Mapping(target = "educationHistory", ignore = true)
    @Mapping(target = "certifications", ignore = true)
    @Mapping(target = "languages", ignore = true)
    @Mapping(target = "seniorityLevel", ignore = true)
    @Mapping(target = "yearsOfExperience", ignore = true)
    @Mapping(target = "profileSummary", ignore = true)
    @Mapping(target = "cvLanguage", ignore = true)
    @Mapping(target = "overallScore", ignore = true)
    @Mapping(target = "overallAssessment", ignore = true)
    @Mapping(target = "strengths", ignore = true)
    @Mapping(target = "weaknesses", ignore = true)
    @Mapping(target = "recommendations", ignore = true)
    @Mapping(target = "atsCompatibility", ignore = true)
    @Mapping(target = "missingKeywords", ignore = true)
    @Mapping(target = "improvementPriority", ignore = true)
    @Mapping(target = "formatScore", ignore = true)
    @Mapping(target = "contentScore", ignore = true)
    @Mapping(target = "skillsScore", ignore = true)
    @Mapping(target = "experienceScore", ignore = true)
    @Mapping(target = "scoreExplanation", ignore = true)
    @Mapping(target = "cvProcessedAt", ignore = true)
    @Mapping(target = "aiModelUsed", ignore = true)
    @Mapping(target = "cvDetectedLanguage", ignore = true)
    CandidateProfile fromRegistrationRequest(CandidateRegistrationRequest request);
    
    // === MAPPINGS VERS CANDIDATEPROFILERESPONSE ===
    
    /**
     * Convertit un CandidateProfile en réponse complète
     */
    @Mapping(target = "fullName", expression = "java(profile.getFullName())")
    @Mapping(target = "userType", constant = "CANDIDATE")
    @Mapping(target = "roles", ignore = true) // Sera ajouté manuellement depuis JWT
    @Mapping(target = "status", ignore = true) // Sera ajouté manuellement depuis JWT
    @Mapping(target = "experiences", source = "experiences")
    @Mapping(target = "educationHistory", source = "educationHistory")
    @Mapping(target = "certifications", source = "certifications")
    @Mapping(target = "languages", source = "languages")
    CandidateProfileResponse toResponse(CandidateProfile profile);
    
    // === MAPPINGS POUR STRUCTURES COMPLEXES ===
    
    /**
     * Convertit Experience vers ExperienceDto
     */
    CandidateProfileResponse.ExperienceDto toExperienceDto(CandidateProfile.Experience experience);
    
    /**
     * Convertit Education vers EducationDto
     */
    CandidateProfileResponse.EducationDto toEducationDto(CandidateProfile.Education education);
    
    /**
     * Convertit Certification vers CertificationDto
     */
    CandidateProfileResponse.CertificationDto toCertificationDto(CandidateProfile.Certification certification);
    
    /**
     * Convertit LanguageProficiency vers LanguageProficiencyDto
     */
    CandidateProfileResponse.LanguageProficiencyDto toLanguageProficiencyDto(CandidateProfile.LanguageProficiency language);
    
    // === MAPPINGS POUR LISTES ===
    
    /**
     * Convertit une liste d'Experience vers ExperienceDto
     */
    default List<CandidateProfileResponse.ExperienceDto> toExperienceDtoList(List<CandidateProfile.Experience> experiences) {
        if (experiences == null) return null;
        return experiences.stream()
                .map(this::toExperienceDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convertit une liste d'Education vers EducationDto
     */
    default List<CandidateProfileResponse.EducationDto> toEducationDtoList(List<CandidateProfile.Education> educations) {
        if (educations == null) return null;
        return educations.stream()
                .map(this::toEducationDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convertit une liste de Certification vers CertificationDto
     */
    default List<CandidateProfileResponse.CertificationDto> toCertificationDtoList(List<CandidateProfile.Certification> certifications) {
        if (certifications == null) return null;
        return certifications.stream()
                .map(this::toCertificationDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convertit une liste de LanguageProficiency vers LanguageProficiencyDto
     */
    default List<CandidateProfileResponse.LanguageProficiencyDto> toLanguageProficiencyDtoList(List<CandidateProfile.LanguageProficiency> languages) {
        if (languages == null) return null;
        return languages.stream()
                .map(this::toLanguageProficiencyDto)
                .collect(Collectors.toList());
    }
    
    // === MÉTHODES UTILITAIRES ===
    
    /**
     * Met à jour un profil existant avec les données d'inscription
     * (utilisé pour les mises à jour partielles)
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "keycloakId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRegistrationRequest(@MappingTarget CandidateProfile profile, CandidateRegistrationRequest request);
}
