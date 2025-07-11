package com.pfe2025.jobpostingservice.service;



import com.pfe2025.jobpostingservice.model.*;
import com.pfe2025.jobpostingservice.dto.*;
import com.pfe2025.jobpostingservice.event.RequisitionApprovedEvent;
import com.pfe2025.jobpostingservice.exception.*;
import com.pfe2025.jobpostingservice.mapper.JobPostMapper;
import com.pfe2025.jobpostingservice.mapper.JobPostingSkillMapper;
import com.pfe2025.jobpostingservice.model.enums.PostingStatus;
import com.pfe2025.jobpostingservice.repository.ActivityLogRepository;
import com.pfe2025.jobpostingservice.repository.JobPostRepository;
import com.pfe2025.jobpostingservice.repository.JobPostingSkillRepository;
import com.pfe2025.jobpostingservice.repository.specification.JobPostSpecifications;
import com.pfe2025.jobpostingservice.util.DateUtils;
import com.pfe2025.jobpostingservice.util.SecurityUtils;
import com.pfe2025.jobpostingservice.validator.JobPostValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;



/**
 * Service gérant le cycle de vie complet des offres d'emploi.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JobPostService {

    private final JobPostRepository jobPostRepository;
    private final JobPostingSkillRepository skillRepository;
    private final ActivityLogRepository activityLogRepository;
    private final JobPostMapper jobPostMapper;
    private final JobPostingSkillMapper skillMapper;
    private final JobPostValidator validator;
    private final MetricsService metricsService;
    private final TemplateService templateService;

    /**
     * Crée une nouvelle offre d'emploi.
     *
     * @param requestDTO Les données de l'offre à créer
     * @return L'offre créée
     */
    @Transactional
    public JobPostDTO.Response createJobPost(JobPostDTO.Request requestDTO) {
        log.debug("Creating new job post with title: {}", requestDTO.getTitle());
        validator.validateCreateRequest(requestDTO);

        String currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new InvalidOperationException("Utilisateur non authentifié"));
        String userFullName = SecurityUtils.getCurrentUserFullName().orElse(currentUserId);

        // Convertir DTO en entité
        JobPost jobPost = jobPostMapper.toEntity(requestDTO);
        jobPost.setCreatedBy(currentUserId);
        jobPost.setLastModifiedBy(currentUserId);
        jobPost.setStatus(PostingStatus.DRAFT);

        // Gérer les compétences
        if (requestDTO.getSkills() != null) {
            Set<JobPostingSkill> skills = new HashSet<>();
            for (JobPostingSkillDTO skillDTO : requestDTO.getSkills()) {
                JobPostingSkill skill = skillMapper.toEntity(skillDTO);
                skill.setJobPost(jobPost);
                skills.add(skill);
            }
            jobPost.setSkills(skills);
        }

        // Appliquer le modèle si spécifié
        if (requestDTO.getTemplateId() != null) {
            templateService.applyTemplateToJobPost(jobPost, requestDTO.getTemplateId());
        }

        // Initialiser les métriques
        PostingMetrics metrics = PostingMetrics.builder()
                .jobPost(jobPost)
                .totalViewCount(0)
                .uniqueViewCount(0)
                .totalApplicationCount(0)
                .conversionRate(0.0)
                .lastUpdated(LocalDateTime.now())
                .build();
        jobPost.setMetrics(metrics);

        // Créer le journal d'activité
        ActivityLog logactivity = ActivityLog.createCreationLog(jobPost, currentUserId, userFullName);
        jobPost.addActivityLog(logactivity);

        // Persister l'entité
        JobPost savedJobPost = jobPostRepository.save(jobPost);
        log.info("Created job post with ID: {}", savedJobPost.getId());

        return jobPostMapper.toResponseDto(savedJobPost);
    }

    /**
     * Met à jour une offre d'emploi existante.
     *
     * @param id L'identifiant de l'offre à mettre à jour
     * @param requestDTO Les nouvelles données de l'offre
     * @return L'offre mise à jour
     */
    @Transactional
    @CacheEvict(cacheNames = {"jobPosts", "publishedJobPosts"}, allEntries = true)
    public JobPostDTO.Response updateJobPost(Long id, JobPostDTO.Request requestDTO) {
        log.debug("Updating job post with ID: {}", id);
        JobPost jobPost = jobPostRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found with ID: " + id));

        validator.validateUpdateRequest(requestDTO, jobPost.getStatus());

        String currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new InvalidOperationException("Utilisateur non authentifié"));
        String userFullName = SecurityUtils.getCurrentUserFullName().orElse(currentUserId);

        // Mettre à jour les champs de base
        jobPostMapper.updateFromDto(requestDTO, jobPost);
        jobPost.setLastModifiedBy(currentUserId);
        jobPost.setLastModifiedAt(LocalDateTime.now());

        // Mettre à jour les compétences
        updateJobPostSkills(jobPost, requestDTO.getSkills());

        // Créer entrée de journal
        ActivityLog logactivity = ActivityLog.createUpdateLog(
                jobPost, currentUserId, userFullName, "Mise à jour de l'offre");
        jobPost.addActivityLog(logactivity);

        // Persister les modifications
        JobPost updatedJobPost = jobPostRepository.save(jobPost);
        log.info("Updated job post with ID: {}", updatedJobPost.getId());

        return jobPostMapper.toResponseDto(updatedJobPost);
    }

    /**
     * Récupère une offre d'emploi par son identifiant.
     *
     * @param id L'identifiant de l'offre à récupérer
     * @return L'offre d'emploi
     */
    @Transactional(readOnly = true)
    @CacheEvict(cacheNames = {"jobPosts", "publishedJobPosts"}, allEntries = true)
    public JobPostDTO.Response getJobPostById(Long id) {
        log.debug("Fetching job post with ID: {}", id);
        JobPost jobPost = jobPostRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found with ID: " + id));

        return jobPostMapper.toResponseDto(jobPost);
    }

    /**
     * Supprime une offre d'emploi.
     *
     * @param id L'identifiant de l'offre à supprimer
     */
    @Transactional
    @CacheEvict(cacheNames = {"jobPosts", "publishedJobPosts"}, allEntries = true)
    public void deleteJobPost(Long id) {
        log.debug("Deleting job post with ID: {}", id);
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found with ID: " + id));

        if (jobPost.getStatus() != PostingStatus.DRAFT) {
            throw new InvalidOperationException("Only draft job posts can be deleted");
        }

        jobPostRepository.delete(jobPost);
        log.info("Deleted job post with ID: {}", id);
    }

    /**
     * Publie une offre d'emploi.
     *
     * @param id L'identifiant de l'offre à publier
     * @param requestDTO Les données de publication
     * @return L'offre publiée
     */
    @Transactional
    @CacheEvict(cacheNames = {"jobPosts", "publishedJobPosts"}, allEntries = true)
    public JobPostDTO.Response publishJobPost(Long id, JobPostDTO.PublishRequest requestDTO) {
        log.debug("Publishing job post with ID: {}", id);
        JobPost jobPost = jobPostRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found with ID: " + id));

        validator.validatePublishRequest(requestDTO, jobPost);

        String currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new InvalidOperationException("Utilisateur non authentifié"));
        String userFullName = SecurityUtils.getCurrentUserFullName().orElse(currentUserId);

        PostingStatus previousStatus = jobPost.getStatus();
        jobPost.setStatus(PostingStatus.PUBLISHED);
        jobPost.setPublishedAt(LocalDateTime.now());
        jobPost.setExpiresAt(requestDTO.getExpiresAt());
        jobPost.setPublicationLevel(requestDTO.getPublicationLevel());
        jobPost.setLastModifiedBy(currentUserId);
        jobPost.setLastModifiedAt(LocalDateTime.now());

        // Créer entrée de journal
        ActivityLog logactivity = ActivityLog.createPublishLog(jobPost, currentUserId, userFullName);
        jobPost.addActivityLog(logactivity);

        // Créer également une entrée pour le changement de statut
        ActivityLog statusLog = ActivityLog.createStatusChangeLog(
                jobPost, currentUserId, userFullName, previousStatus.toString(), PostingStatus.PUBLISHED.toString());
        jobPost.addActivityLog(statusLog);

        JobPost publishedJobPost = jobPostRepository.save(jobPost);
        log.info("Published job post with ID: {}", publishedJobPost.getId());

        return jobPostMapper.toResponseDto(publishedJobPost);
    }

    /**
     * Ferme une offre d'emploi.
     *
     * @param id L'identifiant de l'offre à fermer
     * @param closeRequest Les données de fermeture
     * @return L'offre fermée
     */
    @Transactional
    @CacheEvict(cacheNames = {"jobPosts", "publishedJobPosts"}, allEntries = true)
    public JobPostDTO.Response closeJobPost(Long id, JobPostDTO.CloseRequest closeRequest) {
        log.debug("Closing job post with ID: {}", id);
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found with ID: " + id));

        if (jobPost.getStatus() == PostingStatus.CLOSED || jobPost.getStatus() == PostingStatus.ARCHIVED) {
            throw new InvalidOperationException("Job post is already closed or archived");
        }

        String currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new InvalidOperationException("Utilisateur non authentifié"));
        String userFullName = SecurityUtils.getCurrentUserFullName().orElse(currentUserId);

        PostingStatus previousStatus = jobPost.getStatus();
        jobPost.setStatus(PostingStatus.CLOSED);
        jobPost.setClosedAt(LocalDateTime.now());
        jobPost.setLastModifiedBy(currentUserId);
        jobPost.setLastModifiedAt(LocalDateTime.now());

        // Créer entrée de journal
        ActivityLog logactivity = ActivityLog.createCloseLog(
                jobPost, currentUserId, userFullName, closeRequest.getReason());
        jobPost.addActivityLog(logactivity);

        // Créer également une entrée pour le changement de statut
        ActivityLog statusLog = ActivityLog.createStatusChangeLog(
                jobPost, currentUserId, userFullName, previousStatus.toString(), PostingStatus.CLOSED.toString());
        jobPost.addActivityLog(statusLog);

        JobPost closedJobPost = jobPostRepository.save(jobPost);
        log.info("Closed job post with ID: {}", closedJobPost.getId());

        return jobPostMapper.toResponseDto(closedJobPost);
    }

    /**
     * Change le statut d'une offre d'emploi.
     *
     * @param id L'identifiant de l'offre
     * @param newStatus Le nouveau statut
     * @param comment Un commentaire expliquant le changement
     * @return L'offre avec le statut mis à jour
     */
    @Transactional
    @CacheEvict(cacheNames = {"jobPosts", "publishedJobPosts"}, allEntries = true)
    public JobPostDTO.Response changeJobPostStatus(Long id, PostingStatus newStatus, String comment) {
        log.debug("Changing status of job post {} to {}", id, newStatus);
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found with ID: " + id));

        PostingStatus currentStatus = jobPost.getStatus();
        if (currentStatus == newStatus) {
            log.info("Job post {} is already in status {}", id, newStatus);
            return jobPostMapper.toResponseDto(jobPost);
        }

        validateStatusTransition(currentStatus, newStatus);

        String currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new InvalidOperationException("Utilisateur non authentifié"));
        String userFullName = SecurityUtils.getCurrentUserFullName().orElse(currentUserId);

        // Mettre à jour le statut et les dates associées
        jobPost.setStatus(newStatus);
        jobPost.setLastModifiedBy(currentUserId);
        jobPost.setLastModifiedAt(LocalDateTime.now());

        // Mettre à jour les dates spécifiques selon le statut
        updateStatusSpecificDates(jobPost, newStatus);

        // Créer entrée de journal pour le changement de statut
        ActivityLog statusLog = ActivityLog.createStatusChangeLog(
                jobPost, currentUserId, userFullName, currentStatus.toString(), newStatus.toString());
        if (comment != null && !comment.isBlank()) {
            statusLog.setDetails(statusLog.getDetails() + " - " + comment);
        }
        jobPost.addActivityLog(statusLog);

        JobPost updatedJobPost = jobPostRepository.save(jobPost);
        log.info("Changed status of job post {} from {} to {}", id, currentStatus, newStatus);

        return jobPostMapper.toResponseDto(updatedJobPost);
    }

    /**
     * Recherche les offres d'emploi selon des critères.
     *
     * @param criteria Les critères de recherche
     * @param pageable Les paramètres de pagination
     * @return Les offres correspondant aux critères
     */
    @Transactional(readOnly = true)
    public PageResponseDTO<JobPostDTO.Summary> searchJobPosts(SearchCriteriaDTO criteria, Pageable pageable) {
        log.debug("Searching job posts with criteria: {}, page: {}, size: {}",
                criteria, pageable.getPageNumber(), pageable.getPageSize());

        Specification<JobPost> spec = JobPostSpecifications.fromSearchCriteria(criteria);
        Page<JobPost> jobPostsPage = jobPostRepository.findAll(spec, pageable);

        List<JobPostDTO.Summary> dtos = jobPostMapper.toSummaryDtoList(jobPostsPage.getContent());

        return PageResponseDTO.<JobPostDTO.Summary>builder()
                .content(dtos)
                .pageNumber(jobPostsPage.getNumber())
                .pageSize(jobPostsPage.getSize())
                .totalElements(jobPostsPage.getTotalElements())
                .totalPages(jobPostsPage.getTotalPages())
                .first(jobPostsPage.isFirst())
                .last(jobPostsPage.isLast())
                .build();
    }

    /**
     * Récupère les offres d'emploi publiées et actives.
     *
     * @param pageable Les paramètres de pagination
     * @return Les offres publiées
     */
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "publishedJobPosts", key = "'published_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public PageResponseDTO<JobPostDTO.PublicView> getPublishedJobPosts(Pageable pageable) {
        log.debug("Fetching published job posts, page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<JobPost> jobPostsPage = jobPostRepository.findAllActivePublished(LocalDateTime.now(), pageable);

        List<JobPostDTO.PublicView> dtos = jobPostMapper.toPublicViewDtoList(jobPostsPage.getContent());

        PageResponseDTO<JobPostDTO.PublicView> response = PageResponseDTO.<JobPostDTO.PublicView>builder()
                .content(dtos)
                .pageNumber(jobPostsPage.getNumber())
                .pageSize(jobPostsPage.getSize())
                .totalElements(jobPostsPage.getTotalElements())
                .totalPages(jobPostsPage.getTotalPages())
                .first(jobPostsPage.isFirst())
                .last(jobPostsPage.isLast())
                .build();

        return response;
    }

    /**
     * Crée une offre d'emploi à partir d'une réquisition approuvée.
     *
     * @param event L'événement de réquisition approuvée
     * @return L'offre créée
     */
    @Transactional
    public JobPostDTO.Response createFromRequisition(RequisitionApprovedEvent event) {
        log.debug("Creating job post from requisition with ID: {}", event.getRequisitionId());

        // Vérifier si une offre existe déjà pour cette réquisition
        List<JobPost> existingPosts = jobPostRepository.findByRequisitionId(event.getRequisitionId());
        if (!existingPosts.isEmpty()) {
            log.info("Job post already exists for requisition ID: {}", event.getRequisitionId());
            return jobPostMapper.toResponseDto(existingPosts.get(0));
        }

        // Convertir l'événement en entité JobPost
        JobPost jobPost = jobPostMapper.fromRequisitionEvent(event);

        // Créer l'offre d'emploi
        JobPostDTO.Request request = new JobPostDTO.Request();
        request.setTitle(event.getTitle());
        request.setDepartment(event.getDepartment());
        request.setDescription(event.getDescription());
        request.setRequisitionId(event.getRequisitionId());
        request.setMinExperience(event.getMinExperience());

        // Ajouter les compétences
        Set<JobPostingSkillDTO> skillDTOs = new HashSet<>();
        if (event.getRequiredSkills() != null) {
            for (String skillName : event.getRequiredSkills()) {
                JobPostingSkillDTO skillDTO = new JobPostingSkillDTO();
                skillDTO.setName(skillName);
                skillDTO.setIsRequired(true);
                skillDTOs.add(skillDTO);
            }
            request.setSkills(skillDTOs);
        }

        // Trouver un modèle approprié pour le département
        templateService.findActiveTemplateByDepartment(event.getDepartment())
                .ifPresent(template -> request.setTemplateId(template.getId()));

        return createJobPost(request);
    }

    /**
     * Ferme les offres d'emploi liées à une réquisition.
     *
     * @param requisitionId L'identifiant de la réquisition
     * @param reason La raison de la fermeture
     * @return Le nombre d'offres fermées
     */
    @Transactional
    public int closeJobPostsFromRequisition(Long requisitionId, String reason) {
        log.debug("Closing job posts from requisition with ID: {}", requisitionId);
        List<JobPost> jobPosts = jobPostRepository.findByRequisitionId(requisitionId);

        int closedCount = 0;
        for (JobPost jobPost : jobPosts) {
            if (jobPost.getStatus() != PostingStatus.CLOSED && jobPost.getStatus() != PostingStatus.ARCHIVED) {
                JobPostDTO.CloseRequest closeRequest = new JobPostDTO.CloseRequest();
                closeRequest.setReason(reason);
                closeJobPost(jobPost.getId(), closeRequest);
                closedCount++;
            }
        }

        log.info("Closed {} job posts from requisition ID: {}", closedCount, requisitionId);
        return closedCount;
    }

    /**
     * Met à jour le statut des offres d'emploi expirées.
     *
     * @return Le nombre d'offres mises à jour
     */
    @Transactional
    public int updateExpiredJobPosts() {
        log.debug("Updating expired job posts");
        int count = jobPostRepository.updateExpiredJobPosts(LocalDateTime.now());
        log.info("Updated {} expired job posts", count);
        return count;
    }

    /**
     * Identifie les offres qui vont bientôt expirer.
     *
     * @param daysThreshold Le nombre de jours avant expiration
     * @return Le nombre d'offres identifiées
     */
    @Transactional(readOnly = true)
    public int identifySoonExpiringJobPosts(int daysThreshold) {
        log.debug("Identifying job posts expiring in {} days", daysThreshold);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(daysThreshold);

        Specification<JobPost> spec = (root, query, cb) -> {
            return cb.and(
                    cb.equal(root.get("status"), PostingStatus.PUBLISHED),
                    cb.greaterThan(root.get("expiresAt"), now),
                    cb.lessThan(root.get("expiresAt"), threshold)
            );
        };

        List<JobPost> expiringPosts = jobPostRepository.findAll(spec);
        log.info("Found {} job posts expiring in the next {} days", expiringPosts.size(), daysThreshold);

        // Ici, on pourrait ajouter un système de notification

        return expiringPosts.size();
    }

    /**
     * Rafraîchit le cache des offres publiées.
     */
    @Async
    @CacheEvict(value = "publishedJobPosts", allEntries = true)
    public void refreshPublishedJobPostsCache() {
        log.debug("Refreshing published job posts cache");
        // Cette méthode est marquée @CacheEvict et vide simplement le cache
        log.info("Published job posts cache refreshed");
    }

    /**
     * Incrémente le compteur de vues d'une offre d'emploi.
     *
     * @param id L'identifiant de l'offre
     * @param isUnique Indique s'il s'agit d'une vue unique
     */
    @Async("metricsExecutor")
    @Transactional
    public void incrementViewCount(Long id, boolean isUnique) {
        log.debug("Incrementing view count for job post ID: {}, unique: {}", id, isUnique);
        metricsService.incrementViewCount(id, isUnique);
    }

    /**
     * Met à jour les compétences d'une offre d'emploi.
     *
     * @param jobPost L'offre d'emploi
     * @param skillDTOs Les compétences mises à jour
     */
    private void updateJobPostSkills(JobPost jobPost, Set<JobPostingSkillDTO> skillDTOs) {
        if (skillDTOs == null) {
            return;
        }

        // Supprimer les compétences qui ne sont plus dans la liste
        jobPost.getSkills().removeIf(skill ->
                skillDTOs.stream().noneMatch(dto ->
                        dto.getId() != null && dto.getId().equals(skill.getId())
                )
        );

        // Mettre à jour ou ajouter les compétences
        for (JobPostingSkillDTO dto : skillDTOs) {
            if (dto.getId() != null) {
                // Mettre à jour une compétence existante
                jobPost.getSkills().stream()
                        .filter(skill -> dto.getId().equals(skill.getId()))
                        .findFirst()
                        .ifPresent(skill -> {
                            skill.setName(dto.getName());
                            skill.setIsRequired(dto.getIsRequired());
                            skill.setDescription(dto.getDescription());
                            skill.setLevel(dto.getLevel());
                        });
            } else {
                // Ajouter une nouvelle compétence
                JobPostingSkill newSkill = skillMapper.toEntity(dto);
                newSkill.setJobPost(jobPost);
                jobPost.getSkills().add(newSkill);
            }
        }
    }

    /**
     * Valide la transition de statut.
     *
     * @param currentStatus Le statut actuel
     * @param newStatus Le nouveau statut
     * @throws StatusTransitionException si la transition n'est pas autorisée
     */
    private void validateStatusTransition(PostingStatus currentStatus, PostingStatus newStatus) {
        boolean isValid = switch (currentStatus) {
            case DRAFT -> newStatus == PostingStatus.REVIEW || newStatus == PostingStatus.PUBLISHED;
            case REVIEW -> newStatus == PostingStatus.DRAFT || newStatus == PostingStatus.PUBLISHED;
            case PUBLISHED -> newStatus == PostingStatus.EXPIRED || newStatus == PostingStatus.CLOSED;
            case EXPIRED -> newStatus == PostingStatus.CLOSED || newStatus == PostingStatus.ARCHIVED;
            case CLOSED -> newStatus == PostingStatus.ARCHIVED;
            case ARCHIVED -> false; // Aucune transition depuis ARCHIVED
        };

        if (!isValid) {
            throw new StatusTransitionException(currentStatus.toString(), newStatus.toString());
        }
    }

    /**
     * Met à jour les dates spécifiques selon le statut.
     *
     * @param jobPost L'offre d'emploi
     * @param newStatus Le nouveau statut
     */
    private void updateStatusSpecificDates(JobPost jobPost, PostingStatus newStatus) {
        LocalDateTime now = LocalDateTime.now();

        switch (newStatus) {
            case PUBLISHED:
                jobPost.setPublishedAt(now);
                if (jobPost.getExpiresAt() == null) {
                    jobPost.setExpiresAt(DateUtils.calculateDefaultExpirationDate());
                }
                break;
            case CLOSED:
                jobPost.setClosedAt(now);
                break;
            case EXPIRED:
                // Rien à faire, la date d'expiration est déjà définie
                break;
            default:
                // Aucune date spécifique à mettre à jour pour les autres statuts
                break;
        }
    }
}
