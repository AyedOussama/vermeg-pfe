package com.pfe2025.jobpostingservice.repository;

import com.pfe2025.jobpostingservice.model.ContentFragment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour les fragments de contenu réutilisables.
 */
@Repository
public interface ContentFragmentRepository extends JpaRepository<ContentFragment, Long> {

    /**
     * Trouve un fragment par clé.
     */
    Optional<ContentFragment> findByFragmentKey(String fragmentKey);

    /**
     * Trouve les fragments par type.
     */
    List<ContentFragment> findByTypeAndIsActiveTrue(String type);

    /**
     * Trouve les fragments par type et langue.
     */
    List<ContentFragment> findByTypeAndLanguageAndIsActiveTrue(String type, String language);

    /**
     * Recherche de fragments par contenu.
     */
    @Query("SELECT f FROM ContentFragment f WHERE " +
            "LOWER(f.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<ContentFragment> searchByContent(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Recherche avancée de fragments.
     */
    @Query("SELECT f FROM ContentFragment f WHERE " +
            "(:isActive IS NULL OR f.isActive = :isActive) AND " +
            "(:type IS NULL OR f.type = :type) AND " +
            "(:language IS NULL OR f.language = :language) AND " +
            "(:keyword IS NULL OR LOWER(f.fragmentKey) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "                     LOWER(f.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ContentFragment> advancedSearch(
            @Param("isActive") Boolean isActive,
            @Param("type") String type,
            @Param("language") String language,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * Trouve les fragments par préfixe de clé.
     */
    @Query("SELECT f FROM ContentFragment f WHERE " +
            "LOWER(f.fragmentKey) LIKE LOWER(CONCAT(:prefix, '%')) " +
            "AND f.isActive = TRUE " +
            "ORDER BY f.fragmentKey")
    List<ContentFragment> findByKeyPrefix(@Param("prefix") String prefix);

    /**
     * Compte les fragments par type.
     */
    long countByType(String type);

    /**
     * Compte les fragments par langue.
     */
    long countByLanguage(String language);

    Page<ContentFragment> findAll(Specification<ContentFragment> spec, Pageable pageable);
}
