package com.pfe2025.application_service.mapper;

import com.pfe2025.application_service.dto.ApplicationDTO;
import com.pfe2025.application_service.model.Application;
import com.pfe2025.application_service.model.ApplicationStatusHistory;
import com.pfe2025.application_service.dto.StatusHistoryDTO;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper pour les entités Application et DTOs associés.
 */
@Mapper(componentModel = "spring",
        uses = {EvaluationMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ApplicationMapper {

    /**
     * Convertit une entité Application en DTO de réponse détaillée.
     */
    @Mapping(target = "statusHistory", source = "statusHistory")
    ApplicationDTO.DetailResponse toDetailResponse(Application application);

    /**
     * Convertit une entité Application en DTO de résumé.
     */
    ApplicationDTO.SummaryResponse toSummaryResponse(Application application);

    /**
     * Convertit une liste d'entités Application en liste de DTOs résumés.
     */
    List<ApplicationDTO.SummaryResponse> toSummaryResponseList(List<Application> applications);

    /**
     * Convertit une entité Application en vue candidat.
     */
    ApplicationDTO.CandidateView toCandidateView(Application application);

    /**
     * Convertit une liste d'entités Application en liste de vues candidat.
     */
    List<ApplicationDTO.CandidateView> toCandidateViewList(List<Application> applications);

    /**
     * Convertit une entité Application en vue tableau de bord.
     */
    @Mapping(target = "daysInCurrentStatus", source = "lastStatusChangedAt", qualifiedByName = "calculateDaysInStatus")
    @Mapping(target = "aiRecommendation", source = "evaluation.recommendation")
    @Mapping(target = "hasDocuments", expression = "java(application.getResumeDocumentId() != null)")
    ApplicationDTO.DashboardView toDashboardView(Application application);

    /**
     * Calcule le nombre de jours dans le statut actuel.
     */
    @Named("calculateDaysInStatus")
    default Long calculateDaysInStatus(java.time.LocalDateTime lastStatusChangedAt) {
        if (lastStatusChangedAt == null) {
            return null;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(lastStatusChangedAt, java.time.LocalDateTime.now());
    }

    /**
     * Convertit une historique de statut en DTO.
     */
    StatusHistoryDTO toStatusHistoryDTO(ApplicationStatusHistory history);

    /**
     * Convertit une liste d'historiques de statut en liste de DTOs.
     */
    List<StatusHistoryDTO> toStatusHistoryDTOList(List<ApplicationStatusHistory> history);
}