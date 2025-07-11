package com.pfe2025.application_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileDTO {
    private String id;
    private String keycloakId;

    // Données personnelles regroupées comme dans l'API
    private PersonalInfoDTO personalInfo;

    private List<String> skills;
    private List<ExperienceDTO> experiences;
    private List<EducationDTO> educationHistory;
    private List<CertificationDTO> certifications;
    private List<LanguageDTO> languages;

    private String seniorityLevel;
    private Integer yearsOfExperience;
    private String profileSummary;
    private String cvLanguage;

    // Métadonnées d'IA comme dans l'API
    private AIMetadataDTO aiMetadata;

    // Format des dates comme chaînes dans l'API
    private String createdAt;
    private String updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalInfoDTO {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;  // 'phone' au lieu de 'phoneNumber' pour correspondre à l'API
        private String address;

        // Méthode utilitaire pour obtenir le nom complet
        public String getFullName() {
            return firstName + " " + lastName;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExperienceDTO {
        private String company;
        private String position;
        private String startDate;
        private String endDate;  // Peut être null
        private String description;

        // Méthode utilitaire pour déterminer si c'est l'emploi actuel
        public Boolean isCurrent() {
            return endDate == null;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EducationDTO {
        private String degree;
        private String institution;
        private String field;  // Peut être null
        private String year;   // Format "Septembre 2022 - présent"

        // Ces getters permettent de maintenir la compatibilité avec votre code existant
        public String getFieldOfStudy() {
            return field;
        }

        // Méthodes utilitaires pour extraire les dates de début et fin
        public LocalDateTime getApproximateStartDate() {
            // Logique pour extraire la date de début à partir de la chaîne "year"
            if (year != null && year.contains("-")) {
                String startPart = year.split("-")[0].trim();
                // Implémentation de l'extraction de date à partir de texte comme "Septembre 2022"
                return parseApproximateDate(startPart);
            }
            return null;
        }

        public LocalDateTime getApproximateEndDate() {
            // Logique pour extraire la date de fin
            if (year != null && year.contains("-")) {
                String[] parts = year.split("-");
                if (parts.length > 1) {
                    String endPart = parts[1].trim();
                    if (endPart.toLowerCase().contains("présent")) {
                        return null; // Toujours en cours
                    }
                    return parseApproximateDate(endPart);
                }
            }
            return null;
        }

        public Boolean isCompleted() {
            if (year != null) {
                return !year.toLowerCase().contains("présent");
            }
            return false;
        }

        // Méthode privée pour analyser une date approximative
        private LocalDateTime parseApproximateDate(String dateText) {
            // Implémentation simplifiée - à compléter selon vos besoins spécifiques
            return LocalDateTime.now();  // Placeholder
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificationDTO {
        private String name;
        private String issuingOrganization;
        private String issueDate;
        private String expiryDate;
        private String credentialId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LanguageDTO {
        private String language;
        private String proficiency;  // Format dans l'API: "Niveau Avancé", "Native", etc.

        // Méthode utilitaire pour obtenir le niveau standardisé
        public String getProficiencyLevel() {
            String level = proficiency.toLowerCase();

            if (level.contains("native")) {
                return "NATIVE";
            } else if (level.contains("avancé") || level.contains("b2") || level.contains("c1")) {
                return "ADVANCED";
            } else if (level.contains("intermédiaire") || level.contains("b1")) {
                return "INTERMEDIATE";
            } else {
                return "BASIC";
            }
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIMetadataDTO {
        private String documentId;
        private String modelUsed;
        private String processedAt;
    }

    // Méthodes utilitaires pour maintenir la compatibilité avec votre code existant

    public String getName() {
        return personalInfo != null ? personalInfo.getFullName() : null;
    }

    public String getEmail() {
        return personalInfo != null ? personalInfo.getEmail() : null;
    }

    public String getPhoneNumber() {
        return personalInfo != null ? personalInfo.getPhone() : null;
    }

    public String getAddress() {
        return personalInfo != null ? personalInfo.getAddress() : null;
    }

    public Map<String, Object> getAdditionalData() {
        // Si nécessaire, vous pouvez construire ici un Map avec des données supplémentaires
        return null;
    }

    public LocalDateTime getCreatedAtDateTime() {
        // Convertir la chaîne de date en LocalDateTime si nécessaire
        return null;  // Placeholder - implémentez selon vos besoins
    }

    public LocalDateTime getUpdatedAtDateTime() {
        // Convertir la chaîne de date en LocalDateTime si nécessaire
        return null;  // Placeholder - implémentez selon vos besoins
    }
}