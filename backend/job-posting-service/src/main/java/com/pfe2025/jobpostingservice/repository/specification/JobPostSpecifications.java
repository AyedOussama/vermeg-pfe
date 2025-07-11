package com.pfe2025.jobpostingservice.repository.specification;

import com.pfe2025.jobpostingservice.dto.SearchCriteriaDTO;
import com.pfe2025.jobpostingservice.model.JobPost;
import com.pfe2025.jobpostingservice.model.JobPostingSkill;
import com.pfe2025.jobpostingservice.model.enums.PostingStatus;

import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Spécifications JPA pour les requêtes complexes sur les offres d'emploi.
 */
public class JobPostSpecifications {

    private JobPostSpecifications() {
        // Classe utilitaire, constructeur privé
    }

    /**
     * Crée une spécification pour rechercher par mot-clé dans le titre et la description.
     */
    public static Specification<JobPost> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(keyword)) {
                return cb.conjunction();
            }

            String wildcardKeyword = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), wildcardKeyword),
                    cb.like(cb.lower(root.get("description")), wildcardKeyword)
            );
        };
    }

    /**
     * Crée une spécification pour filtrer par département.
     */
    public static Specification<JobPost> hasDepartment(String department) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(department)) {
                return cb.conjunction();
            }

            return cb.equal(root.get("department"), department);
        };
    }

    /**
     * Crée une spécification pour filtrer par localisation.
     */
    public static Specification<JobPost> hasLocation(String location) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(location)) {
                return cb.conjunction();
            }

            return cb.equal(root.get("location"), location);
        };
    }

    /**
     * Crée une spécification pour filtrer par statut.
     */
    public static Specification<JobPost> hasStatus(PostingStatus status) {
        return (root, query, cb) -> {
            if (status == null) {
                return cb.conjunction();
            }

            return cb.equal(root.get("status"), status);
        };
    }

    /**
     * Crée une spécification pour filtrer par expérience minimale.
     */
    public static Specification<JobPost> hasMinExperience(Integer minExperience) {
        return (root, query, cb) -> {
            if (minExperience == null) {
                return cb.conjunction();
            }

            return cb.greaterThanOrEqualTo(root.get("minExperience"), minExperience);
        };
    }

    /**
     * Crée une spécification pour filtrer par expérience maximale.
     */
    public static Specification<JobPost> hasMaxExperience(Integer maxExperience) {
        return (root, query, cb) -> {
            if (maxExperience == null) {
                return cb.conjunction();
            }

            return cb.lessThanOrEqualTo(root.get("minExperience"), maxExperience);
        };
    }

    /**
     * Crée une spécification pour filtrer par type d'emploi.
     */
    public static Specification<JobPost> hasEmploymentType(String employmentType) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(employmentType)) {
                return cb.conjunction();
            }

            return cb.equal(root.get("employmentType"), employmentType);
        };
    }

    /**
     * Crée une spécification pour filtrer par compétences requises.
     */
    public static Specification<JobPost> hasSkills(Set<String> skillNames) {
        return (root, query, cb) -> {
            if (CollectionUtils.isEmpty(skillNames)) {
                return cb.conjunction();
            }

            Join<JobPost, JobPostingSkill> skillsJoin = root.join("skills");

            // Dédupliquer les résultats
            query.distinct(true);

            return skillsJoin.get("name").in(skillNames);
        };
    }

    /**
     * Crée une spécification pour filtrer par toutes les compétences requises.
     */
    public static Specification<JobPost> hasAllSkills(Set<String> skillNames) {
        return (root, query, cb) -> {
            if (CollectionUtils.isEmpty(skillNames)) {
                return cb.conjunction();
            }

            // Requête distincte pour éviter les doublons
            query.distinct(true);

            // Subquery pour compter les compétences correspondantes
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<JobPost> subRoot = subquery.correlate(root);
            Join<JobPost, JobPostingSkill> skillsJoin = subRoot.join("skills");

            subquery.select(cb.count(skillsJoin))
                    .where(skillsJoin.get("name").in(skillNames));

            // Vérifier que le nombre de compétences correspondantes est égal au nombre de compétences demandées
            return cb.equal(subquery, (long) skillNames.size());
        };
    }

    /**
     * Crée une spécification à partir des critères de recherche.
     */
    public static Specification<JobPost> fromSearchCriteria(SearchCriteriaDTO criteria) {
        Specification<JobPost> spec = Specification.where(null);

        if (criteria == null) {
            return spec;
        }

        // Ajouter les filtres selon les critères fournis
        if (StringUtils.hasText(criteria.getKeyword())) {
            spec = spec.and(hasKeyword(criteria.getKeyword()));
        }

        if (StringUtils.hasText(criteria.getDepartment())) {
            spec = spec.and(hasDepartment(criteria.getDepartment()));
        }

        if (StringUtils.hasText(criteria.getLocation())) {
            spec = spec.and(hasLocation(criteria.getLocation()));
        }

        if (criteria.getEmploymentType() != null) {
            spec = spec.and(hasEmploymentType(criteria.getEmploymentType().toString()));
        }

        if (criteria.getStatus() != null) {
            spec = spec.and(hasStatus(criteria.getStatus()));
        }

        if (criteria.getMinExperience() != null) {
            spec = spec.and(hasMinExperience(criteria.getMinExperience()));
        }

        if (criteria.getMaxExperience() != null) {
            spec = spec.and(hasMaxExperience(criteria.getMaxExperience()));
        }

        if (!CollectionUtils.isEmpty(criteria.getSkillNames())) {
            spec = spec.and(hasAllSkills(criteria.getSkillNames()));
        }

        // Si publishedOnly est true, filtrer uniquement les offres publiées
        if (criteria.getPublishedOnly() != null && criteria.getPublishedOnly()) {
            spec = spec.and(hasStatus(PostingStatus.PUBLISHED));
        }

        return spec;
    }

    /**
     * Crée une spécification pour filtrer les offres qui seront bientôt expirées.
     */
    public static Specification<JobPost> willExpireSoon(int days) {
        return (root, query, cb) -> {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime future = now.plusDays(days);

            return cb.and(
                    cb.equal(root.get("status"), PostingStatus.PUBLISHED),
                    cb.greaterThan(root.get("expiresAt"), now),
                    cb.lessThan(root.get("expiresAt"), future)
            );
        };
    }

    /**
     * Crée une spécification pour rechercher du texte dans plusieurs champs.
     */
    public static Specification<JobPost> searchInAllTextFields(String text) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(text)) {
                return cb.conjunction();
            }

            String wildcardText = "%" + text.toLowerCase() + "%";

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.like(cb.lower(root.get("title")), wildcardText));
            predicates.add(cb.like(cb.lower(root.get("description")), wildcardText));
            predicates.add(cb.like(cb.lower(root.get("responsibilities")), wildcardText));
            predicates.add(cb.like(cb.lower(root.get("qualifications")), wildcardText));
            predicates.add(cb.like(cb.lower(root.get("benefits")), wildcardText));

            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }
}
