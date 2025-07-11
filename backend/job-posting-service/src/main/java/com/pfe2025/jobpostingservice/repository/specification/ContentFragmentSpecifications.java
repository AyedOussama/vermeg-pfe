package com.pfe2025.jobpostingservice.repository.specification;

import com.pfe2025.jobpostingservice.model.ContentFragment;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

/**
 * Spécifications JPA pour les requêtes complexes sur les fragments de contenu.
 */
public class ContentFragmentSpecifications {

    private ContentFragmentSpecifications() {
        // Classe utilitaire, constructeur privé
    }

    /**
     * Crée une spécification pour filtrer par type.
     */
    public static Specification<ContentFragment> hasType(String type) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(type)) {
                return cb.conjunction();
            }

            return cb.equal(root.get("type"), type);
        };
    }

    /**
     * Crée une spécification pour filtrer par langue.
     */
    public static Specification<ContentFragment> hasLanguage(String language) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(language)) {
                return cb.conjunction();
            }

            return cb.equal(root.get("language"), language);
        };
    }

    /**
     * Crée une spécification pour filtrer les fragments actifs.
     */
    public static Specification<ContentFragment> isActive(Boolean active) {
        return (root, query, cb) -> {
            if (active == null) {
                return cb.conjunction();
            }

            return cb.equal(root.get("isActive"), active);
        };
    }

    /**
     * Crée une spécification pour rechercher du texte dans la clé ou le contenu.
     */
    public static Specification<ContentFragment> containsText(String text) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(text)) {
                return cb.conjunction();
            }

            String wildcardText = "%" + text.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("fragmentKey")), wildcardText),
                    cb.like(cb.lower(root.get("content")), wildcardText)
            );
        };
    }
}
