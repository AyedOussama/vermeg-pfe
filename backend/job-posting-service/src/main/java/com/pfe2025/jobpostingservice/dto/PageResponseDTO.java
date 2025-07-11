package com.pfe2025.jobpostingservice.dto;



import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * DTO générique pour les réponses paginées.
 *
 * @param <T> Le type de contenu paginé
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Réponse paginée")
public class PageResponseDTO<T> {

    @Schema(description = "Contenu de la page")
    private List<T> content;

    @Schema(description = "Numéro de la page actuelle")
    private int pageNumber;

    @Schema(description = "Taille de la page")
    private int pageSize;

    @Schema(description = "Nombre total d'éléments")
    private long totalElements;

    @Schema(description = "Nombre total de pages")
    private int totalPages;

    @Schema(description = "Indique si c'est la première page")
    private boolean first;

    @Schema(description = "Indique si c'est la dernière page")
    private boolean last;

    /**
     * Crée un DTO PageResponseDTO à partir d'un objet Page Spring.
     *
     * @param page L'objet Page à convertir
     * @return Un nouveau PageResponseDTO contenant les informations de pagination
     */
    public static <T> PageResponseDTO<T> fromPage(Page<T> page) {
        return PageResponseDTO.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
