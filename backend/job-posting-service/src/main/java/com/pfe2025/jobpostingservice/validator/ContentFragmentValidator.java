package com.pfe2025.jobpostingservice.validator;


import com.pfe2025.jobpostingservice.dto.ContentFragmentDTO;
import com.pfe2025.jobpostingservice.exception.ValidationException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Set;

/**
 * Validateur pour les fragments de contenu.
 */
@Component
public class ContentFragmentValidator {

    // Types de fragments autorisés
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "BENEFIT", "DESCRIPTION", "SKILL_DESC", "RESPONSIBILITY", "QUALIFICATION");

    /**
     * Valide une requête de création ou mise à jour de fragment.
     *
     * @param request La requête à valider
     * @throws ValidationException Si la validation échoue
     */
    public void validateRequest(ContentFragmentDTO.Request request) {
        // Validation des champs obligatoires
        if (!StringUtils.hasText(request.getFragmentKey())) {
            throw new ValidationException("La clé du fragment est obligatoire");
        }

        if (!StringUtils.hasText(request.getContent())) {
            throw new ValidationException("Le contenu du fragment est obligatoire");
        }

        if (!StringUtils.hasText(request.getType())) {
            throw new ValidationException("Le type de fragment est obligatoire");
        }

        // Validation du format de la clé
        validateKeyFormat(request.getFragmentKey());

        // Validation du type
        validateType(request.getType());

        // Validation du code de langue
        validateLanguage(request.getLanguage());
    }

    /**
     * Valide le format de la clé du fragment.
     *
     * @param key La clé à valider
     * @throws ValidationException Si la validation échoue
     */
    private void validateKeyFormat(String key) {
        if (!key.matches("^[a-z0-9_.-]+$")) {
            throw new ValidationException("La clé du fragment ne doit contenir que des lettres minuscules, " +
                    "des chiffres, des points, des tirets et des underscores");
        }
    }

    /**
     * Valide le type de fragment.
     *
     * @param type Le type à valider
     * @throws ValidationException Si la validation échoue
     */
    private void validateType(String type) {
        if (!ALLOWED_TYPES.contains(type)) {
            throw new ValidationException("Type de fragment non reconnu. " +
                    "Types autorisés: " + String.join(", ", ALLOWED_TYPES));
        }
    }

    /**
     * Valide le code de langue.
     *
     * @param language Le code de langue à valider
     * @throws ValidationException Si la validation échoue
     */
    private void validateLanguage(String language) {
        if (language != null && !language.matches("^[a-z]{2}(-[A-Z]{2})?$")) {
            throw new ValidationException("Le code de langue doit respecter le format ISO (ex: fr, en, fr-FR)");
        }
    }
}
