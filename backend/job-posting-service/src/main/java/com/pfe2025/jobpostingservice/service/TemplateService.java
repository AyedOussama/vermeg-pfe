package com.pfe2025.jobpostingservice.service;



import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.pfe2025.jobpostingservice.dto.PageResponseDTO;
import com.pfe2025.jobpostingservice.dto.PostingTemplateDTO;
import com.pfe2025.jobpostingservice.exception.InvalidOperationException;
import com.pfe2025.jobpostingservice.exception.ResourceNotFoundException;
import com.pfe2025.jobpostingservice.exception.ValidationException;
import com.pfe2025.jobpostingservice.mapper.PostingTemplateMapper;
import com.pfe2025.jobpostingservice.model.JobPost;
import com.pfe2025.jobpostingservice.model.PostingTemplate;
import com.pfe2025.jobpostingservice.repository.PostingTemplateRepository;
import com.pfe2025.jobpostingservice.util.SecurityUtils;
import com.pfe2025.jobpostingservice.validator.TemplateValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service de gestion des modèles d'offres d'emploi.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateService {

    private final PostingTemplateRepository templateRepository;
    private final PostingTemplateMapper templateMapper;
    private final TemplateValidator validator;
    private final ObjectMapper objectMapper;

    /**
     * Crée un nouveau modèle d'offre d'emploi.
     *
     * @param requestDTO Les données du modèle à créer
     * @return Le modèle créé
     */
    @Transactional
    @CacheEvict(value = "templates", allEntries = true)
    public PostingTemplateDTO.Response createTemplate(PostingTemplateDTO.Request requestDTO) {
        log.debug("Creating new template with name: {}", requestDTO.getName());
        validator.validateRequest(requestDTO);

        // Vérifier que le nom n'existe pas déjà
        if (templateRepository.findByName(requestDTO.getName()).isPresent()) {
            throw new ValidationException("Un modèle avec ce nom existe déjà");
        }

        String currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new InvalidOperationException("Utilisateur non authentifié"));

        PostingTemplate template = templateMapper.toEntity(requestDTO);
        template.setCreatedBy(currentUserId);

        PostingTemplate savedTemplate = templateRepository.save(template);
        log.info("Created template with ID: {}", savedTemplate.getId());

        return templateMapper.toResponseDto(savedTemplate);
    }

    /**
     * Met à jour un modèle existant.
     *
     * @param id L'identifiant du modèle
     * @param requestDTO Les nouvelles données du modèle
     * @return Le modèle mis à jour
     */
    @Transactional
    @CacheEvict(value = "templates", allEntries = true)
    public PostingTemplateDTO.Response updateTemplate(Long id, PostingTemplateDTO.Request requestDTO) {
        log.debug("Updating template with ID: {}", id);
        validator.validateRequest(requestDTO);

        PostingTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + id));

        // Vérifier qu'un autre modèle n'a pas déjà ce nom
        Optional<PostingTemplate> existingWithName = templateRepository.findByName(requestDTO.getName());
        if (existingWithName.isPresent() && !existingWithName.get().getId().equals(id)) {
            throw new ValidationException("Un autre modèle existe déjà avec ce nom");
        }

        templateMapper.updateFromDto(requestDTO, template);
        template.setLastModifiedAt(LocalDateTime.now());

        PostingTemplate updatedTemplate = templateRepository.save(template);
        log.info("Updated template with ID: {}", updatedTemplate.getId());

        return templateMapper.toResponseDto(updatedTemplate);
    }

    /**
     * Supprime un modèle.
     *
     * @param id L'identifiant du modèle à supprimer
     */
    @Transactional
    @CacheEvict(value = "templates", allEntries = true)
    public void deleteTemplate(Long id) {
        log.debug("Deleting template with ID: {}", id);
        PostingTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + id));

        templateRepository.delete(template);
        log.info("Deleted template with ID: {}", id);
    }

    /**
     * Récupère un modèle par son identifiant.
     *
     * @param id L'identifiant du modèle
     * @return Le modèle
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "templates", key = "#id")
    public PostingTemplateDTO.Response getTemplateById(Long id) {
        log.debug("Fetching template with ID: {}", id);
        PostingTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + id));

        return templateMapper.toResponseDto(template);
    }

    /**
     * Récupère tous les modèles actifs.
     *
     * @return La liste des modèles actifs
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "templates", key = "'active'")
    public List<PostingTemplateDTO.Summary> getAllActiveTemplates() {
        log.debug("Fetching all active templates");
        List<PostingTemplate> templates = templateRepository.findByIsActiveTrue();

        return templateMapper.toSummaryDtoList(templates);
    }

    /**
     * Recherche des modèles avec pagination.
     *
     * @param isActive Filtre sur le statut actif
     * @param department Filtre sur le département
     * @param keyword Mot-clé de recherche
     * @param pageable Paramètres de pagination
     * @return La page de résultats
     */
    @Transactional(readOnly = true)
    public PageResponseDTO<PostingTemplateDTO.Summary> searchTemplates(
            Boolean isActive, String department, String keyword, Pageable pageable) {
        log.debug("Searching templates with criteria: isActive={}, department={}, keyword={}",
                isActive, department, keyword);

        Page<PostingTemplate> templatesPage = templateRepository.advancedSearch(
                isActive, department, keyword, pageable);

        List<PostingTemplateDTO.Summary> dtos = templateMapper.toSummaryDtoList(templatesPage.getContent());

        return PageResponseDTO.<PostingTemplateDTO.Summary>builder()
                .content(dtos)
                .pageNumber(templatesPage.getNumber())
                .pageSize(templatesPage.getSize())
                .totalElements(templatesPage.getTotalElements())
                .totalPages(templatesPage.getTotalPages())
                .first(templatesPage.isFirst())
                .last(templatesPage.isLast())
                .build();
    }

    /**
     * Trouve un modèle actif par département.
     *
     * @param department Le département
     * @return Le modèle trouvé ou empty si aucun
     */
    @Transactional(readOnly = true)
    public Optional<PostingTemplateDTO.Response> findActiveTemplateByDepartment(String department) {
        log.debug("Finding active template for department: {}", department);

        List<PostingTemplate> templates = templateRepository.findByDepartmentAndIsActiveTrue(department);
        if (templates.isEmpty()) {
            log.debug("No active template found for department: {}", department);
            return Optional.empty();
        }

        // Prendre le premier modèle trouvé
        PostingTemplate template = templates.get(0);
        log.debug("Found active template ID: {} for department: {}", template.getId(), department);

        return Optional.of(templateMapper.toResponseDto(template));
    }

    /**
     * Active ou désactive un modèle.
     *
     * @param id L'identifiant du modèle
     * @param active L'état d'activation
     * @return Le modèle mis à jour
     */
    @Transactional
    @CacheEvict(value = "templates", allEntries = true)
    public PostingTemplateDTO.Response setTemplateActive(Long id, boolean active) {
        log.debug("Setting template {} active status to: {}", id, active);

        PostingTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + id));

        template.setIsActive(active);
        template.setLastModifiedAt(LocalDateTime.now());

        PostingTemplate updatedTemplate = templateRepository.save(template);
        log.info("Updated template {} active status to: {}", id, active);

        return templateMapper.toResponseDto(updatedTemplate);
    }

    /**
     * Applique un modèle à une offre d'emploi.
     *
     * @param jobPost L'offre d'emploi
     * @param templateId L'identifiant du modèle
     */
    @Transactional
    public void applyTemplateToJobPost(JobPost jobPost, Long templateId) {
        log.debug("Applying template {} to job post", templateId);

        PostingTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + templateId));

        if (!template.getIsActive()) {
            throw new InvalidOperationException("Le modèle n'est pas actif");
        }

        try {
            // Analyser la structure du modèle
            JsonNode structureNode = objectMapper.readTree(template.getStructure());

            // Vérifier que la structure contient des sections
            if (!structureNode.has("sections") || !structureNode.get("sections").isArray()) {
                throw new ValidationException("La structure du modèle est invalide");
            }

            // Appliquer le modèle en fonction des sections définies
            jobPost.setTemplateId(templateId);

            // On pourrait ici appliquer des règles spécifiques selon les sections du modèle
            // Par exemple, pré-remplir certains champs avec des valeurs par défaut

            log.info("Applied template {} to job post", templateId);
        } catch (JsonProcessingException e) {
            log.error("Error parsing template structure", e);
            throw new ValidationException("La structure du modèle est invalide: " + e.getMessage());
        }
    }

    /**
     * Extrait le contenu structuré d'un modèle.
     *
     * @param templateId L'identifiant du modèle
     * @return La structure du modèle
     */
    @Transactional(readOnly = true)
    public JsonNode getTemplateStructure(Long templateId) {
        log.debug("Getting structure for template {}", templateId);

        PostingTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + templateId));

        try {
            return objectMapper.readTree(template.getStructure());
        } catch (JsonProcessingException e) {
            log.error("Error parsing template structure", e);
            throw new ValidationException("La structure du modèle est invalide: " + e.getMessage());
        }
    }
}
