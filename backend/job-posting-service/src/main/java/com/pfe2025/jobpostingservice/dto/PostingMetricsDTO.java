package com.pfe2025.jobpostingservice.dto;



import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO pour les métriques d'offres d'emploi.
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Métriques d'une offre d'emploi")
public class PostingMetricsDTO {

    @Schema(description = "Identifiant unique")
    private Long id;

    @Schema(description = "Identifiant de l'offre d'emploi associée")
    private Long jobPostId;

    @Schema(description = "Nombre total de vues")
    private Integer totalViewCount;

    @Schema(description = "Nombre de vues uniques")
    private Integer uniqueViewCount;

    @Schema(description = "Nombre total de candidatures")
    private Integer totalApplicationCount;

    @Schema(description = "Taux de conversion (candidatures/vues uniques en %)")
    private Double conversionRate;

    @Schema(description = "Date de dernière mise à jour")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastUpdated;

    @Schema(description = "Snapshots quotidiens des métriques")
    @Builder.Default
    private List<MetricsDailySnapshotDTO> dailySnapshots = new ArrayList<>();
}
