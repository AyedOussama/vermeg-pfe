package com.PFE2025.user_service.service.impl;

import com.PFE2025.user_service.dto.event.CvParsedEventDto;
import com.PFE2025.user_service.model.CandidateProfile;
import com.PFE2025.user_service.repository.CandidateProfileRepository;
import com.PFE2025.user_service.service.CvDataEnrichmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CvDataEnrichmentServiceImpl implements CvDataEnrichmentService {
    
    private final CandidateProfileRepository candidateProfileRepository;
    
    @Override
    @Transactional
    public void enrichCandidateProfile(CvParsedEventDto cvParsedEvent) {
        String keycloakId = cvParsedEvent.getKeycloakId();
        log.info("🔄 DÉBUT ENRICHISSEMENT - Profil candidat pour keycloakId: {}", keycloakId);
        log.info("   📄 Document ID: {}", cvParsedEvent.getDocumentId());
        
        try {
            // 1. Trouver le profil candidat existant
            CandidateProfile profile = candidateProfileRepository.findByKeycloakId(keycloakId)
                    .orElseThrow(() -> {
                        log.error("❌ ERREUR - Profil candidat non trouvé pour keycloakId: {}", keycloakId);
                        return new RuntimeException("Candidate profile not found for keycloakId: " + keycloakId);
                    });
            
            log.info("✅ PROFIL TROUVÉ - ID: {}, Nom: {} {}", 
                    profile.getId(), profile.getFirstName(), profile.getLastName());
            
            // 2. Enrichir avec les compétences
            if (cvParsedEvent.getSkills() != null && !cvParsedEvent.getSkills().isEmpty()) {
                profile.setSkills(cvParsedEvent.getSkills());
                log.info("   🔧 COMPÉTENCES - {} compétences ajoutées: {}", 
                        cvParsedEvent.getSkills().size(), 
                        cvParsedEvent.getSkills().size() > 5 ? 
                            cvParsedEvent.getSkills().subList(0, 5) + "..." : 
                            cvParsedEvent.getSkills());
            }
            
            // 3. Enrichir avec les expériences
            if (cvParsedEvent.getExperiences() != null && !cvParsedEvent.getExperiences().isEmpty()) {
                List<CandidateProfile.Experience> experiences = cvParsedEvent.getExperiences().stream()
                        .map(this::convertExperience)
                        .collect(Collectors.toList());
                profile.setExperiences(experiences);
                log.info("   💼 EXPÉRIENCES - {} expériences ajoutées", experiences.size());
                experiences.forEach(exp -> 
                    log.info("      • {} chez {} ({} - {})", 
                            exp.getPosition(), exp.getCompany(), exp.getStartDate(), exp.getEndDate()));
            }
            
            // 4. Enrichir avec la formation
            if (cvParsedEvent.getEducationHistory() != null && !cvParsedEvent.getEducationHistory().isEmpty()) {
                List<CandidateProfile.Education> educations = cvParsedEvent.getEducationHistory().stream()
                        .map(this::convertEducation)
                        .collect(Collectors.toList());
                profile.setEducationHistory(educations);
                log.info("   🎓 FORMATION - {} formations ajoutées", educations.size());
                educations.forEach(edu -> 
                    log.info("      • {} en {} - {} ({})", 
                            edu.getDegree(), edu.getField(), edu.getInstitution(), edu.getYear()));
            }
            
            // 5. Enrichir avec les certifications
            if (cvParsedEvent.getCertifications() != null && !cvParsedEvent.getCertifications().isEmpty()) {
                List<CandidateProfile.Certification> certifications = cvParsedEvent.getCertifications().stream()
                        .map(this::convertCertification)
                        .collect(Collectors.toList());
                profile.setCertifications(certifications);
                log.info("   🏆 CERTIFICATIONS - {} certifications ajoutées", certifications.size());
                certifications.forEach(cert -> 
                    log.info("      • {} par {} ({})", cert.getName(), cert.getIssuer(), cert.getDate()));
            }
            
            // 6. Enrichir avec les langues
            if (cvParsedEvent.getLanguages() != null && !cvParsedEvent.getLanguages().isEmpty()) {
                List<CandidateProfile.LanguageProficiency> languages = cvParsedEvent.getLanguages().stream()
                        .map(this::convertLanguage)
                        .collect(Collectors.toList());
                profile.setLanguages(languages);
                log.info("   🌍 LANGUES - {} langues ajoutées", languages.size());
                languages.forEach(lang -> 
                    log.info("      • {} - {}", lang.getLanguage(), lang.getProficiency()));
            }
            
            // 7. Enrichir avec l'analyse de carrière
            profile.setSeniorityLevel(cvParsedEvent.getSeniorityLevel());
            profile.setYearsOfExperience(cvParsedEvent.getYearsOfExperience());
            profile.setProfileSummary(cvParsedEvent.getProfileSummary());
            profile.setCvLanguage(cvParsedEvent.getCvLanguage());
            
            log.info("   📊 ANALYSE CARRIÈRE - Niveau: {}, Expérience: {} ans, Langue CV: {}", 
                    cvParsedEvent.getSeniorityLevel(), 
                    cvParsedEvent.getYearsOfExperience(), 
                    cvParsedEvent.getCvLanguage());
            
            // 8. Enrichir avec l'analyse ATS
            if (cvParsedEvent.getAtsAnalysis() != null) {
                var ats = cvParsedEvent.getAtsAnalysis();
                profile.setOverallScore(ats.getOverallScore());
                profile.setOverallAssessment(ats.getOverallAssessment());
                profile.setStrengths(ats.getStrengths());
                profile.setWeaknesses(ats.getWeaknesses());
                profile.setRecommendations(ats.getRecommendations());
                profile.setAtsCompatibility(ats.getAtsCompatibility());
                profile.setMissingKeywords(ats.getMissingKeywords());
                profile.setImprovementPriority(ats.getImprovementPriority());
                
                if (ats.getScoreBreakdown() != null) {
                    var breakdown = ats.getScoreBreakdown();
                    profile.setFormatScore(breakdown.getFormatScore());
                    profile.setContentScore(breakdown.getContentScore());
                    profile.setSkillsScore(breakdown.getSkillsScore());
                    profile.setExperienceScore(breakdown.getExperienceScore());
                    profile.setScoreExplanation(breakdown.getScoreExplanation());
                }
                
                log.info("   🎯 ANALYSE ATS - Score global: {}/100, Compatibilité: {}, Priorité: {}", 
                        ats.getOverallScore(), ats.getAtsCompatibility(), ats.getImprovementPriority());
            }
            
            // 9. Enrichir avec les métadonnées IA
            if (cvParsedEvent.getAiMetadata() != null) {
                var metadata = cvParsedEvent.getAiMetadata();
                profile.setCvProcessedAt(metadata.getProcessedAt());
                profile.setAiModelUsed(metadata.getModelUsed());
                profile.setCvDetectedLanguage(metadata.getDetectedLanguage());
                
                log.info("   🤖 MÉTADONNÉES IA - Modèle: {}, Traité le: {}", 
                        metadata.getModelUsed(), metadata.getProcessedAt());
            }
            
            // 10. Sauvegarder le profil enrichi
            CandidateProfile savedProfile = candidateProfileRepository.save(profile);
            
            log.info("✅ ENRICHISSEMENT TERMINÉ - Profil candidat mis à jour avec succès");
            log.info("   📋 RÉSUMÉ:");
            log.info("      • Compétences: {} ajoutées", profile.getSkills() != null ? profile.getSkills().size() : 0);
            log.info("      • Expériences: {} ajoutées", profile.getExperiences() != null ? profile.getExperiences().size() : 0);
            log.info("      • Formations: {} ajoutées", profile.getEducationHistory() != null ? profile.getEducationHistory().size() : 0);
            log.info("      • Score ATS: {}/100", profile.getOverallScore());
            log.info("      • Profil ID: {}", savedProfile.getId());
            
        } catch (Exception e) {
            log.error("❌ ERREUR ENRICHISSEMENT - Échec pour keycloakId: {} - {}", keycloakId, e.getMessage(), e);
            throw new RuntimeException("Failed to enrich candidate profile for keycloakId: " + keycloakId, e);
        }
    }
    
    // === MÉTHODES DE CONVERSION ===
    
    private CandidateProfile.Experience convertExperience(CvParsedEventDto.Experience source) {
        return CandidateProfile.Experience.builder()
                .company(source.getCompany())
                .position(source.getPosition())
                .startDate(source.getStartDate())
                .endDate(source.getEndDate())
                .description(source.getDescription())
                .build();
    }
    
    private CandidateProfile.Education convertEducation(CvParsedEventDto.Education source) {
        return CandidateProfile.Education.builder()
                .degree(source.getDegree())
                .institution(source.getInstitution())
                .field(source.getField())
                .year(source.getYear())
                .build();
    }
    
    private CandidateProfile.Certification convertCertification(CvParsedEventDto.Certification source) {
        return CandidateProfile.Certification.builder()
                .name(source.getName())
                .issuer(source.getIssuer())
                .date(source.getDate())
                .build();
    }
    
    private CandidateProfile.LanguageProficiency convertLanguage(CvParsedEventDto.LanguageProficiency source) {
        return CandidateProfile.LanguageProficiency.builder()
                .language(source.getLanguage())
                .proficiency(source.getProficiency())
                .build();
    }
}
