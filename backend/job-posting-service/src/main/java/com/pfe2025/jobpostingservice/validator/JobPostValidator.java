package com.pfe2025.jobpostingservice.validator;


import com.pfe2025.jobpostingservice.dto.JobPostDTO;
import com.pfe2025.jobpostingservice.exception.ValidationException;
import com.pfe2025.jobpostingservice.model.JobPost;
import com.pfe2025.jobpostingservice.model.enums.PostingStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Validateur pour les offres d'emploi.
 */
@Component
public class JobPostValidator {

    /**
     * Valide une requête de création d'offre d'emploi.
     *
     * @param request La requête à valider
     * @throws ValidationException Si la validation échoue
     */
    public void validateCreateRequest(JobPostDTO.Request request) {
        // Validation des salaires
        validateSalaryRange(request);

        // Validation de la date d'expiration
        validateExpirationDate(request.getExpiresAt());

        // Validation des champs obligatoires
        validateRequiredFields(request);
    }

    /**
     * Valide une requête de mise à jour d'offre d'emploi.
     *
     * @param request La requête à valider
     * @param currentStatus Le statut actuel de l'offre
     * @throws ValidationException Si la validation échoue
     */
    public void validateUpdateRequest(JobPostDTO.Request request, PostingStatus currentStatus) {
        // Vérifier si la mise à jour est autorisée pour ce statut
        if (currentStatus != PostingStatus.DRAFT && currentStatus != PostingStatus.REVIEW) {
            throw new ValidationException("La mise à jour d'une offre n'est autorisée qu'aux statuts DRAFT ou REVIEW");
        }

        // Validation des salaires
        validateSalaryRange(request);

        // Validation de la date d'expiration
        validateExpirationDate(request.getExpiresAt());

        // Validation des champs obligatoires
        validateRequiredFields(request);
    }

    /**
     * Valide une requête de publication d'offre.
     *
     * @param request La requête à valider
     * @param jobPost L'offre d'emploi actuelle
     * @throws ValidationException Si la validation échoue
     */
    public void validatePublishRequest(JobPostDTO.PublishRequest request, JobPost jobPost) {
        // Vérifier si la publication est autorisée pour ce statut
        if (jobPost.getStatus() != PostingStatus.DRAFT && jobPost.getStatus() != PostingStatus.REVIEW) {
            throw new ValidationException("La publication n'est autorisée que pour les offres en statut DRAFT ou REVIEW");
        }

        // Validation de la date d'expiration
        if (request.getExpiresAt() == null) {
            throw new ValidationException("La date d'expiration est obligatoire pour la publication");
        }

        validateExpirationDate(request.getExpiresAt());

        // Vérification que l'offre est complète
        validateJobPostCompleteness(jobPost);
    }

    /**
     * Valide les champs obligatoires d'une offre d'emploi.
     */
    private void validateRequiredFields(JobPostDTO.Request request) {
        if (!StringUtils.hasText(request.getTitle())) {
            throw new ValidationException("Le titre est obligatoire");
        }

        if (!StringUtils.hasText(request.getDepartment())) {
            throw new ValidationException("Le département est obligatoire");
        }

        if (request.getEmploymentType() == null) {
            throw new ValidationException("Le type de contrat est obligatoire");
        }

        if (!StringUtils.hasText(request.getDescription())) {
            throw new ValidationException("La description est obligatoire");
        }
    }

    /**
     * Valide la complétude d'une offre d'emploi avant publication.
     */
    private void validateJobPostCompleteness(JobPost jobPost) {
        if (!StringUtils.hasText(jobPost.getTitle())) {
            throw new ValidationException("Le titre est obligatoire pour la publication");
        }

        if (!StringUtils.hasText(jobPost.getDepartment())) {
            throw new ValidationException("Le département est obligatoire pour la publication");
        }

        if (jobPost.getEmploymentType() == null) {
            throw new ValidationException("Le type de contrat est obligatoire pour la publication");
        }

        if (!StringUtils.hasText(jobPost.getDescription())) {
            throw new ValidationException("La description est obligatoire pour la publication");
        }

        if (jobPost.getSkills() == null || jobPost.getSkills().isEmpty()) {
            throw new ValidationException("Au moins une compétence est requise pour la publication");
        }
    }

    /**
     * Valide la plage salariale.
     */
    private void validateSalaryRange(JobPostDTO.Request request) {
        BigDecimal minSalary = request.getSalaryRangeMin();
        BigDecimal maxSalary = request.getSalaryRangeMax();

        if (minSalary != null && maxSalary != null) {
            if (minSalary.compareTo(maxSalary) > 0) {
                throw new ValidationException("Le salaire minimum ne peut pas être supérieur au salaire maximum");
            }

            if (minSalary.compareTo(BigDecimal.ZERO) < 0 || maxSalary.compareTo(BigDecimal.ZERO) < 0) {
                throw new ValidationException("Les salaires ne peuvent pas être négatifs");
            }
        } else if (minSalary != null && minSalary.compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("Le salaire minimum ne peut pas être négatif");
        } else if (maxSalary != null && maxSalary.compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("Le salaire maximum ne peut pas être négatif");
        }
    }

    /**
     * Valide la date d'expiration.
     */
    private void validateExpirationDate(LocalDateTime expiresAt) {
        if (expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) {
            throw new ValidationException("La date d'expiration doit être dans le futur");
        }
    }
}
