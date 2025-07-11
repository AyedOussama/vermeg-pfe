package com.pfe2025.jobpostingservice.repository;

import com.pfe2025.jobpostingservice.model.JobPostingSkill;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

/**
 * Repository pour les compétences associées aux offres d'emploi.
 */
@Repository
public interface JobPostingSkillRepository extends JpaRepository<JobPostingSkill, Long> {

    /**
     * Trouve les compétences par id d'offre d'emploi.
     */
    List<JobPostingSkill> findByJobPostId(Long jobPostId);

    /**
     * Trouve une compétence par id d'offre et nom de compétence.
     */
    JobPostingSkill findByJobPostIdAndName(Long jobPostId, String name);

    /**
     * Compte les compétences par id d'offre et nom de compétence.
     */
    long countByJobPostIdAndName(Long jobPostId, String name);

    /**
     * Supprime les compétences par id d'offre.
     */
    void deleteByJobPostId(Long jobPostId);

    /**
     * Trouve les compétences les plus demandées.
     */
    @Query("SELECT s.name, COUNT(s) as skillCount FROM JobPostingSkill s " +
            "JOIN s.jobPost jp WHERE jp.status = 'PUBLISHED' " +
            "GROUP BY s.name ORDER BY skillCount DESC")
    List<Object[]> findTopSkills(Pageable pageable);

    /**
     * Recherche de compétences par préfixe pour l'autocomplétion.
     */
    @Query("SELECT DISTINCT s.name FROM JobPostingSkill s " +
            "WHERE LOWER(s.name) LIKE LOWER(CONCAT(:prefix, '%')) " +
            "ORDER BY s.name")
    List<String> findSkillNamesByPrefix(@Param("prefix") String prefix);

    /**
     * Trouve toutes les compétences uniques.
     */
    @Query("SELECT DISTINCT s.name FROM JobPostingSkill s ORDER BY s.name")
    List<String> findAllDistinctSkillNames();

    /**
     * Trouve les offres ayant toutes les compétences spécifiées.
     */
    @Query("SELECT jp.id FROM JobPost jp " +
            "JOIN jp.skills s " +
            "WHERE s.name IN :skillNames " +
            "GROUP BY jp.id " +
            "HAVING COUNT(DISTINCT s.name) = :skillCount")
    Set<Long> findJobPostsWithAllSkills(
            @Param("skillNames") Set<String> skillNames,
            @Param("skillCount") long skillCount);
}
