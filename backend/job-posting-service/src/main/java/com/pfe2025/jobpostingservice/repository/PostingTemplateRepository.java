package com.pfe2025.jobpostingservice.repository;

import com.pfe2025.jobpostingservice.model.PostingTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour les modèles d'offres d'emploi.
 */
@Repository
public interface PostingTemplateRepository extends JpaRepository<PostingTemplate, Long> {

    /**
     * Trouve un modèle par nom.
     */
    Optional<PostingTemplate> findByName(String name);

    /**
     * Trouve les modèles actifs.
     */
    List<PostingTemplate> findByIsActiveTrue();

    /**
     * Trouve les modèles par département.
     */
    List<PostingTemplate> findByDepartmentAndIsActiveTrue(String department);

    /**
     * Recherche de modèles par nom ou description.
     */
    @Query("SELECT t FROM PostingTemplate t WHERE " +
            "LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<PostingTemplate> search(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Recherche avancée de modèles.
     */
    @Query("SELECT t FROM PostingTemplate t WHERE " +
            "(:isActive IS NULL OR t.isActive = :isActive) AND " +
            "(:department IS NULL OR t.department = :department) AND " +
            "(:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "                     LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<PostingTemplate> advancedSearch(
            @Param("isActive") Boolean isActive,
            @Param("department") String department,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * Compte les modèles par département.
     */
    long countByDepartment(String department);

    /**
     * Compte les modèles actifs.
     */
    long countByIsActiveTrue();
}
