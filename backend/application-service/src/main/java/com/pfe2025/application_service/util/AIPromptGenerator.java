package com.pfe2025.application_service.util;

import com.pfe2025.application_service.dto.CandidateProfileDTO;
import com.pfe2025.application_service.dto.JobPostingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AIPromptGenerator {

    /**
     * Génère un prompt d'évaluation complet en utilisant toutes les données disponibles
     * du candidat et de l'offre d'emploi
     */
    public String generateCompleteEvaluationPrompt(JobPostingDTO jobPosting, CandidateProfileDTO candidateProfile) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Évaluation de l'adéquation candidat-poste\n\n");
        prompt.append("Tu es un expert en recrutement avec une connaissance approfondie dans le domaine technique. ");
        prompt.append("Tu dois évaluer l'adéquation d'un candidat pour un poste donné en comparant son profil et l'offre d'emploi.\n\n");

        // Informations sur le poste
        prompt.append("### POSTE À POURVOIR ###\n");
        prompt.append("Titre: ").append(jobPosting.getTitle()).append("\n");
        prompt.append("Département: ").append(jobPosting.getDepartment()).append("\n");
        prompt.append("Type de contrat: ").append(jobPosting.getEmploymentType()).append("\n");
        prompt.append("Lieu: ").append(jobPosting.getLocation()).append("\n\n");

        if (jobPosting.getDescription() != null) {
            prompt.append("Description du poste: ").append(jobPosting.getDescription()).append("\n\n");
        }

        if (jobPosting.getResponsibilities() != null) {
            prompt.append("Responsabilités: ").append(jobPosting.getResponsibilities()).append("\n\n");
        }

        if (jobPosting.getQualifications() != null) {
            prompt.append("Qualifications requises: ").append(jobPosting.getQualifications()).append("\n\n");
        }

        if (jobPosting.getRequiredSkills() != null && !jobPosting.getRequiredSkills().isEmpty()) {
            prompt.append("Compétences requises: ");
            jobPosting.getRequiredSkills().forEach(skill -> prompt.append(skill).append(", "));
            prompt.append("\n");
        }

        if (jobPosting.getPreferredSkills() != null && !jobPosting.getPreferredSkills().isEmpty()) {
            prompt.append("Compétences souhaitées: ");
            jobPosting.getPreferredSkills().forEach(skill -> prompt.append(skill).append(", "));
            prompt.append("\n");
        }

        prompt.append("Niveau d'expérience requis: ").append(jobPosting.getExperienceLevel()).append("\n");
        prompt.append("Années d'expérience minimales: ").append(jobPosting.getMinYearsExperience()).append("\n\n");

        // Informations sur le candidat
        prompt.append("### PROFIL CANDIDAT ###\n");
        String candidateName = "";
        if (candidateProfile.getPersonalInfo() != null) {
            candidateName = candidateProfile.getPersonalInfo().getFirstName() + " " +
                    candidateProfile.getPersonalInfo().getLastName();
            prompt.append("Nom: ").append(candidateName).append("\n");
            prompt.append("Email: ").append(candidateProfile.getPersonalInfo().getEmail()).append("\n");
            prompt.append("Téléphone: ").append(candidateProfile.getPersonalInfo().getPhone()).append("\n");
            prompt.append("Adresse: ").append(candidateProfile.getPersonalInfo().getAddress()).append("\n\n");
        } else {
            candidateName = candidateProfile.getName();
            prompt.append("Nom: ").append(candidateName).append("\n\n");
        }

        if (candidateProfile.getProfileSummary() != null) {
            prompt.append("Résumé du profil: ").append(candidateProfile.getProfileSummary()).append("\n\n");
        }

        prompt.append("Niveau d'ancienneté: ").append(candidateProfile.getSeniorityLevel()).append("\n");
        prompt.append("Années d'expérience: ").append(candidateProfile.getYearsOfExperience()).append("\n\n");

        if (candidateProfile.getSkills() != null && !candidateProfile.getSkills().isEmpty()) {
            prompt.append("Compétences techniques: \n");
            candidateProfile.getSkills().forEach(skill -> prompt.append("- ").append(skill).append("\n"));
            prompt.append("\n");
        }

        if (candidateProfile.getExperiences() != null && !candidateProfile.getExperiences().isEmpty()) {
            prompt.append("Expériences professionnelles: \n");
            candidateProfile.getExperiences().forEach(exp -> {
                prompt.append("- ").append(exp.getPosition()).append(" chez ").append(exp.getCompany());
                if (exp.getStartDate() != null) {
                    prompt.append(" (").append(exp.getStartDate());
                    if (exp.getEndDate() != null) {
                        prompt.append(" - ").append(exp.getEndDate());
                    }
                    prompt.append(")");
                }
                prompt.append("\n  ").append(exp.getDescription()).append("\n\n");
            });
        }

        if (candidateProfile.getEducationHistory() != null && !candidateProfile.getEducationHistory().isEmpty()) {
            prompt.append("Formation: \n");
            candidateProfile.getEducationHistory().forEach(edu -> {
                prompt.append("- ").append(edu.getDegree());
                if (edu.getFieldOfStudy() != null && !edu.getFieldOfStudy().isEmpty()) {
                    prompt.append(" en ").append(edu.getFieldOfStudy());
                }
                prompt.append(" - ").append(edu.getInstitution());
                if (edu.getYear() != null) {
                    prompt.append(" (").append(edu.getYear()).append(")");
                }
                prompt.append("\n");
            });
            prompt.append("\n");
        }

        if (candidateProfile.getCertifications() != null && !candidateProfile.getCertifications().isEmpty()) {
            prompt.append("Certifications: \n");
            candidateProfile.getCertifications().forEach(cert ->
                    prompt.append("- ").append(cert.getName()).append(" - ").append(cert.getIssuingOrganization()).append("\n")
            );
            prompt.append("\n");
        }

        if (candidateProfile.getLanguages() != null && !candidateProfile.getLanguages().isEmpty()) {
            prompt.append("Langues: \n");
            candidateProfile.getLanguages().forEach(lang ->
                    prompt.append("- ").append(lang.getLanguage()).append(": ").append(lang.getProficiencyLevel()).append("\n")
            );
            prompt.append("\n");
        }

        // Instructions d'évaluation
        prompt.append("### INSTRUCTIONS D'ÉVALUATION ###\n");
        prompt.append("Évalue l'adéquation du candidat pour ce poste en utilisant les critères suivants:\n");
        prompt.append("1. Compétences techniques (adéquation des compétences du candidat avec les exigences du poste): 40%\n");
        prompt.append("2. Expérience professionnelle (pertinence et durée de l'expérience par rapport au poste): 30%\n");
        prompt.append("3. Formation et certifications (adéquation de la formation et des certifications avec le poste): 15%\n");
        prompt.append("4. Compétences générales (soft skills, langues, etc.): 15%\n\n");

        prompt.append("Pour chaque critère, attribue un score de 0 à 100, où 100 représente une adéquation parfaite.\n");
        prompt.append("Calcule ensuite un score global pondéré en fonction des pourcentages indiqués.\n\n");

        prompt.append("Identifie 3 forces principales du candidat et 2 points à améliorer par rapport au poste.\n\n");

        prompt.append("En fonction du score global, émets une recommandation:\n");
        prompt.append("- ACCEPT: Score ≥ 75 (candidat à accepter)\n");
        prompt.append("- REVIEW: Score entre 50 et 74 (candidat à revoir)\n");
        prompt.append("- REJECT: Score < 50 (candidat à rejeter)\n");
        prompt.append("- FURTHER_INFO: Informations insuffisantes pour évaluation\n\n");

        prompt.append("### FORMAT DE RÉPONSE ###\n");
        prompt.append("Réponds UNIQUEMENT au format JSON structuré suivant:\n");
        prompt.append("{\n");
        prompt.append("  \"overallScore\": 85.5,\n");
        prompt.append("  \"technicalSkillScore\": 80,\n");
        prompt.append("  \"experienceScore\": 90,\n");
        prompt.append("  \"educationScore\": 85,\n");
        prompt.append("  \"softSkillScore\": 88,\n");
        prompt.append("  \"categoryScores\": {\"Java\": 90, \"Spring\": 85, ...},\n");
        prompt.append("  \"strengths\": \"Force 1; Force 2; Force 3\",\n");
        prompt.append("  \"weaknesses\": \"Faiblesse 1; Faiblesse 2\",\n");
        prompt.append("  \"justification\": \"Justification détaillée de l'évaluation (3-4 phrases)\",\n");
        prompt.append("  \"recommendation\": \"ACCEPT|REJECT|REVIEW|FURTHER_INFO\"\n");
        prompt.append("}\n");

        return prompt.toString();
    }
}