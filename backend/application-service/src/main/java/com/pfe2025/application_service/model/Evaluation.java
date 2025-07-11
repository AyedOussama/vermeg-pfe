package com.pfe2025.application_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// import java.util.Map; // Non utilisé directement ici, mais peut être pertinent pour categoryScores

/**
 * Entité représentant l'évaluation d'une candidature par l'IA.
 */
@Entity
@Table(name = "evaluations")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation extends BaseEntity {

    private static final Logger log = LoggerFactory.getLogger(Evaluation.class);

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "overall_score")
    private Double overallScore;

    @Column(name = "justification", columnDefinition = "TEXT")
    private String justification;

    @Column(name = "technical_skill_score")
    private Double technicalSkillScore;

    @Column(name = "experience_score")
    private Double experienceScore;

    @Column(name = "education_score")
    private Double educationScore;

    @Column(name = "soft_skill_score")
    private Double softSkillScore;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses;

    @Column(name = "recommendation")
    @Enumerated(EnumType.STRING)
    private EvaluationRecommendation recommendation;

    @Column(name = "model_used")
    private String modelUsed;

    @Column(name = "exceeded_auto_threshold")
    private Boolean exceededAutoThreshold;

    @Column(name = "category_scores", columnDefinition = "TEXT")
    private String categoryScores; // JSON String representing Map<String, Double>

    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse;

    /**
     * Énumération des recommandations possibles.
     */
    public enum EvaluationRecommendation {
        ACCEPT,      // Accepter le candidat
        REJECT,      // Rejeter le candidat
        REVIEW,      // Nécessite une revue humaine
        FURTHER_INFO; // Demander plus d'informations

        /**
         * Convertit une chaîne de caractères en une valeur EvaluationRecommendation.
         * Retourne REVIEW si la chaîne est nulle, vide ou ne correspond à aucune valeur.
         *
         * @param text La chaîne à convertir.
         * @return L'EvaluationRecommendation correspondante ou REVIEW par défaut.
         */
        public static EvaluationRecommendation fromString(String text) {
            if (text != null && !text.trim().isEmpty()) {
                for (EvaluationRecommendation rec : EvaluationRecommendation.values()) {
                    if (rec.name().equalsIgnoreCase(text.trim())) {
                        return rec;
                    }
                }
                log.warn("Valeur de recommandation inconnue: '{}'. Utilisation de REVIEW par défaut.", text);
            } else {
                log.warn("Valeur de recommandation nulle ou vide. Utilisation de REVIEW par défaut.");
            }
            return REVIEW; // Valeur par défaut
        }
    }

    /**
     * Détermine si l'évaluation permet une décision automatique d'acceptation.
     *
     * @param threshold Le seuil d'acceptation automatique
     * @return true si le candidat peut être accepté automatiquement
     */
    public boolean isAutoAcceptable(double threshold) {
        return this.overallScore != null && this.overallScore >= threshold;
    }

    /**
     * Détermine si l'évaluation permet une décision automatique de rejet.
     *
     * @param threshold Le seuil de rejet automatique
     * @return true si le candidat peut être rejeté automatiquement
     */
    public boolean isAutoRejectable(double threshold) {
        return this.overallScore != null && this.overallScore <= threshold;
    }
}
