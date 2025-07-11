package com.pfe2025.jobpostingservice.dto;



import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

/**
 * DTO pour les snapshots quotidiens des métriques.
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Snapshot quotidien des métriques d'une offre")
public class MetricsDailySnapshotDTO {

    @Schema(description = "Identifiant unique")
    private Long id;

    @Schema(description = "Date du snapshot")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @Schema(description = "Nombre de vues pour la journée")
    private Integer dailyViewCount;

    @Schema(description = "Nombre de vues uniques pour la journée")
    private Integer dailyUniqueViewCount;

    @Schema(description = "Nombre de candidatures pour la journée")
    private Integer dailyApplicationCount;
}
