package com.pfe2025.jobpostingservice.service;

import com.pfe2025.jobpostingservice.dto.ContentFragmentDTO;
import com.pfe2025.jobpostingservice.dto.PageResponseDTO;
import com.pfe2025.jobpostingservice.exception.InvalidOperationException;
import com.pfe2025.jobpostingservice.exception.ResourceNotFoundException;
import com.pfe2025.jobpostingservice.mapper.ContentFragmentMapper;
import com.pfe2025.jobpostingservice.model.ContentFragment;
import com.pfe2025.jobpostingservice.repository.ContentFragmentRepository;
import com.pfe2025.jobpostingservice.repository.specification.ContentFragmentSpecifications;
import com.pfe2025.jobpostingservice.util.SecurityUtils;
import com.pfe2025.jobpostingservice.validator.ContentFragmentValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service de gestion des fragments de contenu réutilisables.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContentFragmentService {

    private final ContentFragmentRepository fragmentRepository;
    private final ContentFragmentMapper fragmentMapper;
    private final ContentFragmentValidator validator;

    /**
     * Crée un nouveau fragment de contenu.
     *
     * @param requestDTO Les données du fragment à créer
     * @return Le fragment créé
     */
    @Transactional
    @CacheEvict(value = "contentFragments", allEntries = true)
    public ContentFragmentDTO.Response createFragment(ContentFragmentDTO.Request requestDTO) {
        log.debug("Creating new content fragment with key: {}", requestDTO.getFragmentKey());
        validator.validateRequest(requestDTO);

        // Vérifier que la clé n'existe pas déjà
        if (fragmentRepository.findByFragmentKey(requestDTO.getFragmentKey()).isPresent()) {
            throw new InvalidOperationException("Un fragment avec cette clé existe déjà");
        }

        String currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new InvalidOperationException("Utilisateur non authentifié"));

        ContentFragment fragment = fragmentMapper.toEntity(requestDTO);
        fragment.setCreatedBy(currentUserId);
        fragment.setCreatedAt(LocalDateTime.now());

        ContentFragment savedFragment = fragmentRepository.save(fragment);
        log.info("Created content fragment with ID: {}", savedFragment.getId());

        return fragmentMapper.toResponseDto(savedFragment);
    }

    /**
     * Met à jour un fragment existant.
     *
     * @param id L'identifiant du fragment
     * @param requestDTO Les nouvelles données
     * @return Le fragment mis à jour
     */
    @Transactional
    @CacheEvict(value = "contentFragments", allEntries = true)
    public ContentFragmentDTO.Response updateFragment(Long id, ContentFragmentDTO.Request requestDTO) {
        log.debug("Updating content fragment with ID: {}", id);
        validator.validateRequest(requestDTO);

        ContentFragment fragment = fragmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content fragment not found with ID: " + id));

        // Vérifier qu'un autre fragment n'a pas déjà cette clé
        Optional<ContentFragment> existingWithKey = fragmentRepository.findByFragmentKey(requestDTO.getFragmentKey());
        if (existingWithKey.isPresent() && !existingWithKey.get().getId().equals(id)) {
            throw new InvalidOperationException("Un autre fragment existe déjà avec cette clé");
        }

        String currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new InvalidOperationException("Utilisateur non authentifié"));

        fragmentMapper.updateFromDto(requestDTO, fragment);
        fragment.setLastModifiedBy(currentUserId);
        fragment.setLastModifiedAt(LocalDateTime.now());

        ContentFragment updatedFragment = fragmentRepository.save(fragment);
        log.info("Updated content fragment with ID: {}", updatedFragment.getId());

        return fragmentMapper.toResponseDto(updatedFragment);
    }

    /**
     * Supprime un fragment.
     *
     * @param id L'identifiant du fragment à supprimer
     */
    @Transactional
    @CacheEvict(value = "contentFragments", allEntries = true)
    public void deleteFragment(Long id) {
        log.debug("Deleting content fragment with ID: {}", id);
        ContentFragment fragment = fragmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content fragment not found with ID: " + id));

        fragmentRepository.delete(fragment);
        log.info("Deleted content fragment with ID: {}", id);
    }

    /**
     * Récupère un fragment par son identifiant.
     *
     * @param id L'identifiant du fragment
     * @return Le fragment
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "contentFragments", key = "#id")
    public ContentFragmentDTO.Response getFragmentById(Long id) {
        log.debug("Fetching content fragment with ID: {}", id);
        ContentFragment fragment = fragmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content fragment not found with ID: " + id));

        return fragmentMapper.toResponseDto(fragment);
    }

    /**
     * Récupère un fragment par sa clé.
     *
     * @param key La clé du fragment
     * @return Le fragment
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "contentFragments", key = "#key")
    public ContentFragmentDTO.Response getFragmentByKey(String key) {
        log.debug("Fetching content fragment with key: {}", key);
        ContentFragment fragment = fragmentRepository.findByFragmentKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Content fragment not found with key: " + key));

        return fragmentMapper.toResponseDto(fragment);
    }

    /**
     * Récupère tous les fragments par type et langue.
     *
     * @param type Le type de fragment
     * @param language La langue du fragment
     * @return La liste des fragments
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "contentFragments", key = "#type + '_' + #language")
    public List<ContentFragmentDTO.Response> getFragmentsByTypeAndLanguage(String type, String language) {
        log.debug("Fetching content fragments by type: {} and language: {}", type, language);
        List<ContentFragment> fragments = fragmentRepository.findByTypeAndLanguageAndIsActiveTrue(type, language);

        return fragmentMapper.toResponseDtoList(fragments);
    }

    /**
     * Recherche des fragments.
     *
     * @param isActive Filtre sur le statut actif
     * @param type Filtre sur le type
     * @param language Filtre sur la langue
     * @param keyword Mot-clé de recherche
     * @param pageable Paramètres de pagination
     * @return La page de résultats
     */
    @Transactional(readOnly = true)
    public PageResponseDTO<ContentFragmentDTO.Summary> searchFragments(
            Boolean isActive, String type, String language, String keyword, Pageable pageable) {
        log.debug("Searching content fragments with criteria: isActive={}, type={}, language={}, keyword={}",
                isActive, type, language, keyword);

        Specification<ContentFragment> spec = Specification.where(null);

        if (isActive != null) {
            spec = spec.and(ContentFragmentSpecifications.isActive(isActive));
        }

        if (type != null && !type.isBlank()) {
            spec = spec.and(ContentFragmentSpecifications.hasType(type));
        }

        if (language != null && !language.isBlank()) {
            spec = spec.and(ContentFragmentSpecifications.hasLanguage(language));
        }

        if (keyword != null && !keyword.isBlank()) {
            spec = spec.and(ContentFragmentSpecifications.containsText(keyword));
        }

        Page<ContentFragment> fragmentsPage = fragmentRepository.findAll(spec, pageable);

        List<ContentFragmentDTO.Summary> dtos = fragmentMapper.toSummaryDtoList(fragmentsPage.getContent());

        return PageResponseDTO.<ContentFragmentDTO.Summary>builder()
                .content(dtos)
                .pageNumber(fragmentsPage.getNumber())
                .pageSize(fragmentsPage.getSize())
                .totalElements(fragmentsPage.getTotalElements())
                .totalPages(fragmentsPage.getTotalPages())
                .first(fragmentsPage.isFirst())
                .last(fragmentsPage.isLast())
                .build();
    }

    /**
     * Active ou désactive un fragment.
     *
     * @param id L'identifiant du fragment
     * @param active L'état d'activation
     * @return Le fragment mis à jour
     */
    @Transactional
    @CacheEvict(value = "contentFragments", allEntries = true)
    public ContentFragmentDTO.Response setFragmentActive(Long id, boolean active) {
        log.debug("Setting content fragment {} active status to: {}", id, active);

        ContentFragment fragment = fragmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content fragment not found with ID: " + id));

        String currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new InvalidOperationException("Utilisateur non authentifié"));

        fragment.setIsActive(active);
        fragment.setLastModifiedBy(currentUserId);
        fragment.setLastModifiedAt(LocalDateTime.now());

        ContentFragment updatedFragment = fragmentRepository.save(fragment);
        log.info("Updated content fragment {} active status to: {}", id, active);

        return fragmentMapper.toResponseDto(updatedFragment);
    }

    /**
     * Récupère les suggestions de fragments pour l'autocomplétion.
     *
     * @param prefix Le préfixe de recherche
     * @param limit Le nombre maximum de résultats
     * @return La liste des fragments correspondants
     */
    @Transactional(readOnly = true)
    public List<ContentFragmentDTO.Summary> getFragmentSuggestions(String prefix, int limit) {
        log.debug("Getting content fragment suggestions for prefix: {}, limit: {}", prefix, limit);

        List<ContentFragment> fragments = fragmentRepository.findByKeyPrefix(prefix);

        return fragmentMapper.toSummaryDtoList(fragments.stream()
                .limit(limit)
                .toList());
    }
}
