package com.pfe2025.jobpostingservice.validator;



import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.pfe2025.jobpostingservice.dto.PostingTemplateDTO;
import com.pfe2025.jobpostingservice.exception.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Validateur pour les modèles d'offres d'emploi.
 */
@Component
public class TemplateValidator {

    private final ObjectMapper objectMapper;

    @Autowired
    public TemplateValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Valide une requête de création ou mise à jour de modèle.
     *
     * @param request La requête à valider
     * @throws ValidationException Si la validation échoue
     */
    public void validateRequest(PostingTemplateDTO.Request request) {
        // Validation des champs obligatoires
        if (!StringUtils.hasText(request.getName())) {
            throw new ValidationException("Le nom du modèle est obligatoire");
        }

        // Validation de la structure JSON
        validateStructure(request.getStructure());
    }

    /**
     * Valide la structure JSON du modèle.
     *
     * @param structure La structure JSON à valider
     * @throws ValidationException Si la validation échoue
     */
    public void validateStructure(String structure) {
        if (!StringUtils.hasText(structure)) {
            throw new ValidationException("La structure du modèle est obligatoire");
        }

        try {
            JsonNode structureNode = objectMapper.readTree(structure);

            // Vérifier que la structure contient les sections obligatoires
            if (!structureNode.has("sections") || !structureNode.get("sections").isArray()) {
                throw new ValidationException("La structure doit contenir un tableau de sections");
            }

            JsonNode sections = structureNode.get("sections");
            for (JsonNode section : sections) {
                if (!section.has("id") || !section.has("title")) {
                    throw new ValidationException("Chaque section doit avoir un identifiant et un titre");
                }
            }

        } catch (JsonProcessingException e) {
            throw new ValidationException("La structure n'est pas un JSON valide: " + e.getMessage());
        }
    }
}
