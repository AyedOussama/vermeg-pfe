package com.pfe2025.application_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe2025.application_service.config.ApplicationProperties;
import com.pfe2025.application_service.dto.*;
import com.pfe2025.application_service.event.*;
import com.pfe2025.application_service.exception.InvalidOperationException;
import com.pfe2025.application_service.exception.ResourceNotFoundException;
import com.pfe2025.application_service.integration.*;
import com.pfe2025.application_service.mapper.ApplicationMapper;
import com.pfe2025.application_service.model.AISettings;
import com.pfe2025.application_service.model.Application;
import com.pfe2025.application_service.model.Application.ApplicationStatus;
import com.pfe2025.application_service.model.ApplicationStatusHistory;
import com.pfe2025.application_service.model.OutboxEvent;
import com.pfe2025.application_service.repository.AISettingsRepository;
import com.pfe2025.application_service.repository.ApplicationRepository;
import com.pfe2025.application_service.repository.OutboxEventRepository;
import com.pfe2025.application_service.repository.StatusHistoryRepository;
import com.pfe2025.application_service.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;
import jakarta.persistence.criteria.Predicate;
import reactor.util.function.Tuple2;

/**
 * Service for managing job applications.
 * Provides functionality for creating, searching, and managing the lifecycle
 * of applications, including AI evaluation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@CacheConfig(cacheNames = "applications")
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final AISettingsRepository aiSettingsRepository;
    private final OutboxEventRepository outboxEventRepository;

    private final ApplicationMapper applicationMapper;
    private final ObjectMapper objectMapper;
    private final StreamBridge streamBridge;
    private final ReferenceGenerator referenceGenerator;

    private final CandidateServiceClient candidateServiceClient;
    private final JobPostingServiceClient jobPostingServiceClient;
    private final DocumentServiceClient documentServiceClient;
    private final InterviewServiceClient interviewServiceClient;

    private final EvaluationService evaluationService;
    private final MetricsService metricsService;
    private final NotificationService notificationService;

    @Qualifier("aiTaskExecutor")
    private final Executor aiTaskExecutor;

    private final ApplicationProperties applicationProperties;

    /**
     * Creates a new application after validating candidate profile
     * and job posting.
     *
     * @param candidateId The candidate ID
     * @param request The request data
     * @return The response containing created application information
     * @throws InvalidOperationException If validations fail
     */
    @Transactional
    public ApplicationDTO.CreateResponse createApplication(String candidateId, ApplicationDTO.CreateRequest request) {
        log.debug("Creating application for candidate {} for job posting {}", candidateId, request.getJobPostingId());

        // Check if application already exists
        Optional<Application> existingApplication = applicationRepository
                .findByCandidateIdAndJobPostingId(candidateId, request.getJobPostingId());

        if (existingApplication.isPresent()) {
            throw new InvalidOperationException(
                    "You have already applied for this position (ref: " +
                            existingApplication.get().getReference() + ")");
        }

        // Validate resume
        if (request.getResumeDocumentId() == null) {
            throw new InvalidOperationException("A resume is required to submit an application");
        }

        // Get candidate and job posting data in parallel
        return candidateServiceClient.getCandidateProfile(candidateId)
                .switchIfEmpty(Mono.error(new InvalidOperationException("Candidate profile not found")))
                .zipWith(jobPostingServiceClient.getJobPosting(request.getJobPostingId())
                        .switchIfEmpty(Mono.error(new InvalidOperationException("Job posting not found"))))
                .flatMap(tuple -> {
                    CandidateProfileDTO candidateProfile = tuple.getT1();
                    JobPostingDTO jobPosting = tuple.getT2();

                    // Validate profile completeness
                    if (!isProfileComplete(candidateProfile)) {
                        return Mono.error(new InvalidOperationException(
                                "Your profile is incomplete. Please complete it before submitting an application."));
                    }

                    // Validate job is open
                    if (!"PUBLISHED".equals(jobPosting.getStatus())) {
                        return Mono.error(new InvalidOperationException(
                                "This job posting is no longer open for applications"));
                    }

                    // Create and save application
                    Application application = createApplicationEntity(
                            candidateId,
                            request,
                            candidateProfile,
                            jobPosting);

                    Application savedApplication = applicationRepository.save(application);

                    // Handle events and notifications
                    handleApplicationCreatedEvents(savedApplication, request.getJobPostingId());

                    // Trigger AI evaluation asynchronously if resume is provided
                    CompletableFuture.runAsync(() -> triggerAIEvaluation(savedApplication), aiTaskExecutor);

                    // Build and return response
                    return Mono.just(ApplicationDTO.CreateResponse.builder()
                            .id(savedApplication.getId())
                            .reference(savedApplication.getReference())
                            .status(savedApplication.getStatus())
                            .submittedAt(savedApplication.getSubmittedAt())
                            .build());
                })
                .onErrorMap(e -> {
                    if (e instanceof InvalidOperationException || e instanceof ResourceNotFoundException) {
                        return e;
                    }
                    log.error("Unexpected error creating application", e);
                    return new InvalidOperationException("Error creating application: " + e.getMessage());
                })
                .block(); // This block() is necessary since the method isn't reactive end-to-end
    }

    /**
     * Creates an Application entity with proper initialization.
     */
    private Application createApplicationEntity(String candidateId, ApplicationDTO.CreateRequest request,
                                                CandidateProfileDTO candidateProfile, JobPostingDTO jobPosting) {
        // Generate unique reference
        String reference = referenceGenerator.generateReference(request.getJobPostingId());
        LocalDateTime now = LocalDateTime.now();

        // Create Application entity
        Application application = Application.builder()
                .reference(reference)
                .candidateId(candidateId)
                .jobPostingId(request.getJobPostingId())
                .resumeDocumentId(request.getResumeDocumentId())
                .coverLetterDocumentId(request.getCoverLetterDocumentId())
                .status(ApplicationStatus.SUBMITTED)
                .candidateMessage(request.getCandidateMessage())
                .candidateName(getFullName(candidateProfile))
                .jobTitle(jobPosting.getTitle())
                .jobDepartment(jobPosting.getDepartment())
                .aiProcessed(false)
                .autoDecision(false)
                .isShortlisted(false)
                .submittedAt(now)
                .lastStatusChangedAt(now)
                .createdAt(now)
                .createdBy(candidateId)
                .build();

        // Add initial history entry
        application.addStatusHistoryEntry(null, ApplicationStatus.SUBMITTED, candidateId, "Application submitted");

        return application;
    }

    /**
     * Handles events and notifications after application creation.
     */
    private void handleApplicationCreatedEvents(Application application, Long jobPostingId) {
        // Create event for notification
        ApplicationCreatedEvent event = ApplicationCreatedEvent.builder()
                .applicationId(application.getId())
                .reference(application.getReference())
                .candidateId(application.getCandidateId())
                .jobPostingId(application.getJobPostingId())
                .status(application.getStatus())
                .createdAt(application.getSubmittedAt())
                .candidateName(application.getCandidateName())
                .jobTitle(application.getJobTitle())
                .build();

        // Publish event via outbox pattern
        createOutboxEvent("application", application.getId(), "ApplicationCreated", event);

        // Create and publish metrics event
        ApplicationMetricsEvent metricsEvent = ApplicationMetricsEvent.builder()
                .jobPostingId(jobPostingId)
                .reference(application.getReference())
                .candidateId(application.getCandidateId())
                .candidateName(application.getCandidateName())
                .jobTitle(application.getJobTitle())
                .jobDepartment(application.getJobDepartment())
                .submittedAt(LocalDateTime.now())
                .build();

        // Direct publish using StreamBridge
        streamBridge.send("applicationMetricsSupplier-out-0", metricsEvent);

        // Send notification to candidate
        notificationService.sendApplicationSubmittedNotification(application);
    }

    /**
     * Trigger AI evaluation for an application.
     *
     * @param application The application to evaluate
     */
    @Async
    public void triggerAIEvaluation(Application application) {
        log.debug("Triggering AI evaluation for application {}", application.getId());

        try {
            // Check if we already have an AI evaluation
            if (Boolean.TRUE.equals(application.getAiProcessed())) {
                log.info("Application {} is already AI processed, skipping evaluation", application.getId());
                return;
            }

            // Make sure we have a resume
            if (application.getResumeDocumentId() == null) {
                log.warn("Cannot evaluate application {} without a resume", application.getId());
                return;
            }

            // Update application status to under review
            if (application.getStatus() == ApplicationStatus.SUBMITTED) {
                updateApplicationStatusForAIReview(application);
            }

            // Get AI settings for the department
            Optional<AISettings> aiSettings = aiSettingsRepository.findByDepartmentAndIsActive(
                    application.getJobDepartment(), true);

            // Create evaluation request event
            ApplicationEvaluationRequestedEvent requestEvent = ApplicationEvaluationRequestedEvent.builder()
                    .applicationId(application.getId())
                    .reference(application.getReference())
                    .candidateId(application.getCandidateId())
                    .jobPostingId(application.getJobPostingId())
                    .resumeDocumentId(application.getResumeDocumentId())
                    .coverLetterDocumentId(application.getCoverLetterDocumentId())
                    .candidateName(application.getCandidateName())
                    .jobTitle(application.getJobTitle())
                    .requestedAt(LocalDateTime.now())
                    .build();

            // Request evaluation (evaluationService will handle the response via event)
            evaluationService.requestEvaluation(requestEvent);

        } catch (Exception e) {
            log.error("Error triggering AI evaluation for application {}: {}",
                    application.getId(), e.getMessage(), e);
        }
    }

    /**
     * Updates the application status to UNDER_REVIEW for AI evaluation.
     */
    private void updateApplicationStatusForAIReview(Application application) {
        application.setStatus(ApplicationStatus.UNDER_REVIEW);
        application.setLastStatusChangedAt(LocalDateTime.now());
        application.setLastStatusChangedBy("SYSTEM");
        application.addStatusHistoryEntry(
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.UNDER_REVIEW,
                "SYSTEM",
                "Application is under AI review");
        applicationRepository.save(application);
    }

    /**
     * Creates an outbox event for eventual consistency.
     *
     * @param aggregateType The aggregate type
     * @param aggregateId The aggregate ID
     * @param eventType The event type
     * @param payload The event payload
     */
    private void createOutboxEvent(String aggregateType, Long aggregateId, String eventType, Object payload) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);

            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .payload(jsonPayload)
                    .processed(false)
                    .retryCount(0)
                    .creationTime(LocalDateTime.now())
                    .build();

            outboxEventRepository.save(outboxEvent);
            log.debug("Created outbox event: {} for {}", eventType, aggregateId);
        } catch (JsonProcessingException e) {
            log.error("Error serializing event payload: {}", e.getMessage(), e);
        }
    }

    /**
     * Validate the status transition for an application.
     *
     * @param currentStatus The current status
     * @param newStatus The new status
     * @throws InvalidOperationException If the transition is invalid
     */
    private void validateStatusTransition(ApplicationStatus currentStatus, ApplicationStatus newStatus) {
        if (currentStatus == newStatus) {
            return; // No change, always valid
        }

        // Define valid transitions
        Map<ApplicationStatus, Set<ApplicationStatus>> validTransitions = getValidStatusTransitions();

        // Check if transition is valid
        Set<ApplicationStatus> allowedTransitions = validTransitions.get(currentStatus);
        if (allowedTransitions == null || !allowedTransitions.contains(newStatus)) {
            throw new InvalidOperationException(
                    "Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }

    /**
     * Returns a map of valid status transitions.
     */
    private Map<ApplicationStatus, Set<ApplicationStatus>> getValidStatusTransitions() {
        Map<ApplicationStatus, Set<ApplicationStatus>> validTransitions = new HashMap<>();

        validTransitions.put(ApplicationStatus.SUBMITTED,
                Set.of(ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN));

        validTransitions.put(ApplicationStatus.UNDER_REVIEW,
                Set.of(ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN));

        validTransitions.put(ApplicationStatus.SHORTLISTED,
                Set.of(ApplicationStatus.INTERVIEW_REQUESTED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN));

        validTransitions.put(ApplicationStatus.INTERVIEW_REQUESTED,
                Set.of(ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.SHORTLISTED,
                        ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN));

        validTransitions.put(ApplicationStatus.INTERVIEW_SCHEDULED,
                Set.of(ApplicationStatus.INTERVIEW_COMPLETED, ApplicationStatus.INTERVIEW_REQUESTED,
                        ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN));

        validTransitions.put(ApplicationStatus.INTERVIEW_COMPLETED,
                Set.of(ApplicationStatus.OFFER_EXTENDED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN));

        validTransitions.put(ApplicationStatus.OFFER_EXTENDED,
                Set.of(ApplicationStatus.HIRED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN));

        return validTransitions;
    }

    /**
     * Unified method for application search with pagination, filtering and sorting.
     * Replaces legacy specific duplicated methods.
     *
     * @param criteria The search criteria
     * @param pageable The pagination information
     * @param candidateId The candidate ID (optional, to filter by candidate)
     * @param userRole The user role (determines return DTO type)
     * @return A page of appropriate results based on role
     */
    @Transactional(readOnly = true)
    public <T> PageResponseDTO<T> findApplications(
            SearchCriteriaDTO criteria,
            Pageable pageable,
            String candidateId,
            UserRole userRole) {

        log.debug("Finding applications with criteria: {}, role: {}", criteria, userRole);

        // If candidateId is provided, add it to the criteria
        if (StringUtils.hasText(candidateId)) {
            criteria.setCandidateId(candidateId);
        }

        // Build search specification
        Specification<Application> spec = buildSearchSpecification(criteria);

        // Execute search
        Page<Application> applicationsPage = applicationRepository.findAll(spec, pageable);

        // Convert results based on user role
        return convertPageResultsByRole(applicationsPage, userRole);
    }

    /**
     * Converts page results to appropriate DTO types based on user role.
     */
    private <T> PageResponseDTO<T> convertPageResultsByRole(Page<Application> applicationsPage, UserRole userRole) {
        switch(userRole) {
            case CANDIDATE:
                List<ApplicationDTO.CandidateView> candidateViews =
                        applicationMapper.toCandidateViewList(applicationsPage.getContent());
                enrichCandidateViews(candidateViews);
                return createPageResponse((List<T>)candidateViews, applicationsPage);

            case RH_ADMIN:
                List<ApplicationDTO.SummaryResponse> summaryResponses =
                        applicationMapper.toSummaryResponseList(applicationsPage.getContent());
                return createPageResponse((List<T>)summaryResponses, applicationsPage);



            default:
                throw new IllegalArgumentException("Unsupported user role: " + userRole);
        }
    }

    /**
     * Creates a page response DTO from a list of items and a page.
     *
     * @param <T> The type of items in the page
     * @param content The content of the page
     * @param page The original page
     * @return The page response DTO
     */
    private <T> PageResponseDTO<T> createPageResponse(List<T> content, Page<?> page) {
        return PageResponseDTO.<T>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    /**
     * Gets applications for a candidate with pagination.
     *
     * @param candidateId The candidate ID
     * @param pageable The pagination information
     * @return A page of candidate views of applications
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'candidate-' + #candidateId + '-page-' + #pageable.pageNumber")
    public PageResponseDTO<ApplicationDTO.CandidateView> getApplicationsForCandidate(
            String candidateId, Pageable pageable) {

        log.debug("Retrieving applications for candidate {}", candidateId);

        SearchCriteriaDTO criteria = SearchCriteriaDTO.builder()
                .candidateId(candidateId)
                .build();

        return findApplications(criteria, pageable, candidateId, UserRole.CANDIDATE);
    }

    /**
     * Gets a specific application for a candidate.
     *
     * @param candidateId The candidate ID
     * @param applicationId The application ID
     * @return The candidate view of the application
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'candidate-' + #candidateId + '-app-' + #applicationId")
    public ApplicationDTO.CandidateView getApplicationForCandidate(String candidateId, Long applicationId) {
        log.debug("Retrieving application {} for candidate {}", applicationId, candidateId);

        Application application = applicationRepository.findByIdAndCandidateId(applicationId, candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        ApplicationDTO.CandidateView candidateView = applicationMapper.toCandidateView(application);

        // Enrich view with additional data
        enrichCandidateView(candidateView, application);

        return candidateView;
    }

    /**
     * Enriches a single candidate view with all necessary data.
     */
    private void enrichCandidateView(ApplicationDTO.CandidateView candidateView, Application application) {
        // Enrich with documents
        enrichWithDocuments(candidateView, application);

        // Enrich with status history
        List<ApplicationStatusHistory> statusHistory =
                statusHistoryRepository.findByApplicationIdOrderByChangedAtDesc(application.getId());
        candidateView.setStatusHistory(applicationMapper.toStatusHistoryDTOList(statusHistory));

        // Enrich with interview details if applicable
        enrichWithInterviewDetails(candidateView, application);

        // Add feedback message if necessary
        if (application.getStatus() == ApplicationStatus.REJECTED) {
            candidateView.setFeedbackMessage("Thank you for your interest in our company. " +
                    "Unfortunately, your profile doesn't match our current needs. " +
                    "We encourage you to check our other job offers.");
        }
    }

    /**
     * Allows a candidate to withdraw their application.
     *
     * @param candidateId The candidate ID
     * @param applicationId The application ID
     * @param reason The reason for withdrawal
     * @return The updated candidate view
     */
    @Transactional
    @CacheEvict(key = "'candidate-' + #candidateId + '-app-' + #applicationId")
    public ApplicationDTO.CandidateView withdrawApplication(
            String candidateId, Long applicationId, String reason) {

        log.debug("Withdrawing application {} for candidate {}", applicationId, candidateId);

        Application application = applicationRepository.findByIdAndCandidateId(applicationId, candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Check if application can be withdrawn
        if (application.getStatus() == ApplicationStatus.HIRED ||
                application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new InvalidOperationException("Cannot withdraw application in current status: " +
                    application.getStatus());
        }

        // Save previous status
        ApplicationStatus previousStatus = application.getStatus();

        // Update application status to withdrawn
        updateApplicationStatus(
                application,
                ApplicationStatus.WITHDRAWN,
                candidateId,
                reason,
                false);

        // Create event for notification
        ApplicationStatusChangedEvent event = createStatusChangedEvent(
                application,
                previousStatus,
                candidateId,
                false);

        // Publish event via outbox pattern
        createOutboxEvent("application", application.getId(), "ApplicationStatusChanged", event);

        // Send notification
        notificationService.sendApplicationWithdrawnNotification(application);

        // Create and return view
        ApplicationDTO.CandidateView candidateView = applicationMapper.toCandidateView(application);
        enrichCandidateView(candidateView, application);

        return candidateView;
    }

    /**
     * Updates an application's status with auditing information.
     */
    private void updateApplicationStatus(
            Application application,
            ApplicationStatus newStatus,
            String changedBy,
            String reason,
            boolean isSystemChange) {

        application.setStatus(newStatus);
        application.setLastStatusChangedAt(LocalDateTime.now());
        application.setLastStatusChangedBy(changedBy);
        application.setUpdatedAt(LocalDateTime.now());
        application.setUpdatedBy(changedBy);

        // Add entry to history
        application.addStatusHistoryEntry(
                application.getStatus(),
                newStatus,
                changedBy,
                reason);
    }

    /**
     * Creates a status changed event for an application.
     */
    private ApplicationStatusChangedEvent createStatusChangedEvent(
            Application application,
            ApplicationStatus previousStatus,
            String changedBy,
            boolean isSystemChange) {

        return ApplicationStatusChangedEvent.builder()
                .applicationId(application.getId())
                .reference(application.getReference())
                .candidateId(application.getCandidateId())
                .jobPostingId(application.getJobPostingId())
                .previousStatus(previousStatus)
                .newStatus(application.getStatus())
                .changedAt(LocalDateTime.now())
                .changedBy(changedBy)
                .isSystemChange(isSystemChange)
                .isAutomaticDecision(false)
                .candidateName(application.getCandidateName())
                .jobTitle(application.getJobTitle())
                .build();
    }

    /**
     * Adds a document to an application.
     * Optimized to handle only resume and cover letter.
     *
     * @param candidateId The candidate ID
     * @param applicationId The application ID
     * @param documentId The document ID to add
     * @return The list of documents associated with the application
     */
    @Transactional
    @CacheEvict(key = "'candidate-' + #candidateId + '-app-' + #applicationId")
    public List<DocumentDTO> addDocumentToApplication(
            String candidateId, Long applicationId, Long documentId) {

        log.debug("Adding document {} to application {} for candidate {}",
                documentId, applicationId, candidateId);

        Application application = applicationRepository.findByIdAndCandidateId(applicationId, candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Check if application is in a state that allows document addition
        if (application.getStatus() == ApplicationStatus.HIRED ||
                application.getStatus() == ApplicationStatus.WITHDRAWN ||
                application.getStatus() == ApplicationStatus.REJECTED) {
            throw new InvalidOperationException("Cannot add document in current application status: " +
                    application.getStatus());
        }

        // Verify document exists
        return documentServiceClient.getDocument(documentId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Document not found")))
                .flatMap(document -> processDocumentAddition(document, application, candidateId))
                .onErrorMap(e -> {
                    if (e instanceof InvalidOperationException || e instanceof ResourceNotFoundException) {
                        return e;
                    }
                    log.error("Error adding document to application", e);
                    return new InvalidOperationException("Error adding document: " + e.getMessage());
                })
                .block();
    }

    /**
     * Processes the addition of a document to an application.
     */
    private Mono<List<DocumentDTO>> processDocumentAddition(
            DocumentDTO document, Application application, String candidateId) {

        // Determine document type and update application
        String documentType = document.getDocumentType();
        if (documentType != null) {
            switch (documentType.toUpperCase()) {
                case "RESUME":
                case "CV":
                    if (application.getResumeDocumentId() != null) {
                        return Mono.error(new InvalidOperationException(
                                "A resume is already associated with this application. " +
                                        "Please delete the existing resume before adding a new one."));
                    }
                    application.setResumeDocumentId(document.getId());
                    break;
                case "COVER_LETTER":
                case "LETTRE_MOTIVATION":
                    application.setCoverLetterDocumentId(document.getId());
                    break;
                default:
                    return Mono.error(new InvalidOperationException(
                            "Only resume and cover letter documents are supported."));
            }
        } else {
            // If type not specified, reject the request
            return Mono.error(new InvalidOperationException(
                    "Document type must be specified (RESUME or COVER_LETTER)."));
        }

        application.setUpdatedAt(LocalDateTime.now());
        application.setUpdatedBy(candidateId);

        // Save changes
        Application savedApplication = applicationRepository.save(application);

        // Trigger AI evaluation if a resume was added and application hasn't been evaluated
        if ((documentType != null &&
                (documentType.equalsIgnoreCase("RESUME") || documentType.equalsIgnoreCase("CV"))) &&
                !Boolean.TRUE.equals(application.getAiProcessed())) {
            CompletableFuture.runAsync(() -> triggerAIEvaluation(savedApplication), aiTaskExecutor);
        }

        // Return document list (resume and cover letter only)
        return getApplicationDocuments(savedApplication);
    }

    /**
     * Gets the status history for a candidate's application.
     *
     * @param candidateId The candidate ID
     * @param applicationId The application ID
     * @return The list of status history entries
     */
    @Transactional(readOnly = true)
    public List<StatusHistoryDTO> getStatusHistoryForCandidate(String candidateId, Long applicationId) {
        log.debug("Retrieving status history for application {} and candidate {}",
                applicationId, candidateId);

        // Check if application exists and belongs to candidate
        applicationRepository.findByIdAndCandidateId(applicationId, candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Get history
        List<ApplicationStatusHistory> history =
                statusHistoryRepository.findByApplicationIdOrderByChangedAtDesc(applicationId);

        return applicationMapper.toStatusHistoryDTOList(history);
    }

    /**
     * Gets the details of an application.
     *
     * @param applicationId The application ID
     * @return The application details
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'app-details-' + #applicationId")
    public ApplicationDTO.DetailResponse getApplicationDetails(Long applicationId) {
        log.debug("Retrieving application details for {}", applicationId);

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        ApplicationDTO.DetailResponse detailResponse = applicationMapper.toDetailResponse(application);

        // Enrich with documents
        enrichWithDetailDocuments(detailResponse, application);

        // Enrich with status history
        List<ApplicationStatusHistory> statusHistory =
                statusHistoryRepository.findByApplicationIdOrderByChangedAtDesc(applicationId);
        detailResponse.setStatusHistory(applicationMapper.toStatusHistoryDTOList(statusHistory));

        return detailResponse;
    }

    /**
     * Searches applications based on criteria.
     *
     * @param criteria The search criteria
     * @param pageable The pagination information
     * @return A page of application summaries
     */
    @Transactional(readOnly = true)
    public PageResponseDTO<ApplicationDTO.SummaryResponse> searchApplications(
            SearchCriteriaDTO criteria, Pageable pageable) {

        log.debug("Searching applications with criteria: {}", criteria);
        return findApplications(criteria, pageable, null, UserRole.RH_ADMIN);
    }

    /**
     * Gets applications for a job posting.
     *
     * @param jobPostingId The job posting ID
     * @param pageable The pagination information
     * @return A page of application summaries
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'job-' + #jobPostingId + '-page-' + #pageable.pageNumber")
    public PageResponseDTO<ApplicationDTO.SummaryResponse> getApplicationsByJobPosting(
            Long jobPostingId, Pageable pageable) {

        log.debug("Retrieving applications for job posting {}", jobPostingId);

        SearchCriteriaDTO criteria = SearchCriteriaDTO.builder()
                .jobPostingId(jobPostingId)
                .build();

        return findApplications(criteria, pageable, null, UserRole.RH_ADMIN);
    }

    /**
     * Processes a decision on an application.
     *
     * @param applicationId The application ID
     * @param userId The user ID making the decision
     * @param decisionRequest The decision request
     * @return The updated application details
     */
    @Transactional
    @CacheEvict(cacheNames = {"applications"}, allEntries = true)
    public ApplicationDTO.DetailResponse processDecision(
            Long applicationId, String userId, ApplicationDTO.DecisionRequest decisionRequest) {

        log.debug("Processing decision for application {}: {}",
                applicationId, decisionRequest.getNewStatus());

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Check if status transition is valid
        validateStatusTransition(application.getStatus(), decisionRequest.getNewStatus());

        // Save previous status
        ApplicationStatus previousStatus = application.getStatus();

        // Update application status and other fields
        applyDecision(application, decisionRequest, userId);

        // Create event for notification
        ApplicationStatusChangedEvent event = createStatusChangedEvent(
                application,
                previousStatus,
                userId,
                false);

        // Publish event via outbox pattern
        createOutboxEvent("application", application.getId(), "ApplicationStatusChanged", event);

        // Send notification if requested
        sendDecisionNotifications(application, decisionRequest);

        return getApplicationDetails(applicationId);
    }

    /**
     * Applies a decision to an application, updating its status and related fields.
     */
    private void applyDecision(Application application, ApplicationDTO.DecisionRequest decisionRequest, String userId) {
        // Update status
        application.setStatus(decisionRequest.getNewStatus());
        application.setLastStatusChangedAt(LocalDateTime.now());
        application.setLastStatusChangedBy(userId);
        application.setUpdatedAt(LocalDateTime.now());
        application.setUpdatedBy(userId);

        // Update recruiter notes if present
        if (decisionRequest.getRecruiterNotes() != null) {
            application.setRecruiterNotes(decisionRequest.getRecruiterNotes());
        }

        // Handle specific statuses
        if (decisionRequest.getNewStatus() == ApplicationStatus.SHORTLISTED) {
            application.setIsShortlisted(true);
        } else if (decisionRequest.getNewStatus() == ApplicationStatus.REJECTED) {
            application.setIsShortlisted(false);
        }

        // Add entry to history
        application.addStatusHistoryEntry(
                application.getStatus(),
                decisionRequest.getNewStatus(),
                userId,
                "Manual decision: " + decisionRequest.getNewStatus());

        // If application is accepted or rejected, update processing date
        if (decisionRequest.getNewStatus() == ApplicationStatus.SHORTLISTED ||
                decisionRequest.getNewStatus() == ApplicationStatus.REJECTED) {
            if (application.getProcessedAt() == null) {
                application.setProcessedAt(LocalDateTime.now());
            }
        }

        // Save changes
        applicationRepository.save(application);
    }

    /**
     * Sends notifications based on the decision if requested.
     */
    private void sendDecisionNotifications(Application application, ApplicationDTO.DecisionRequest decisionRequest) {
        if (Boolean.TRUE.equals(decisionRequest.getSendNotification())) {
            if (decisionRequest.getNewStatus() == ApplicationStatus.SHORTLISTED) {
                notificationService.sendApplicationShortlistedNotification(application);
            } else if (decisionRequest.getNewStatus() == ApplicationStatus.REJECTED) {
                notificationService.sendApplicationRejectedNotification(application);
            }
        }
    }

    /**
     * Initiates an interview request for an application.
     *
     * @param applicationId The application ID
     * @param userId The user ID requesting the interview
     * @return The updated application details
     */
    @Transactional
    @CacheEvict(cacheNames = {"applications"}, allEntries = true)
    public ApplicationDTO.DetailResponse requestInterview(Long applicationId, String userId) {
        log.debug("Requesting interview for application {}", applicationId);

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        // Check if application is in a state that allows interview request
        if (application.getStatus() != ApplicationStatus.SHORTLISTED) {
            throw new InvalidOperationException(
                    "Cannot request interview for application in status: " + application.getStatus() +
                            ". Application must be SHORTLISTED first.");
        }

        // Update status and save
        ApplicationStatus previousStatus = application.getStatus();
        updateApplicationStatusForInterview(application, userId);

        // Create and publish interview request event
        publishInterviewRequestEvent(application, userId);

        // Try to create interview via interview service
        return createInterviewAndNotify(application, userId);
    }

    /**
     * Updates application status for interview request.
     */
    private void updateApplicationStatusForInterview(Application application, String userId) {
        application.setStatus(ApplicationStatus.INTERVIEW_REQUESTED);
        application.setLastStatusChangedAt(LocalDateTime.now());
        application.setLastStatusChangedBy(userId);
        application.setInterviewRequestedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());
        application.setUpdatedBy(userId);

        // Add entry to history
        application.addStatusHistoryEntry(
                ApplicationStatus.SHORTLISTED,
                ApplicationStatus.INTERVIEW_REQUESTED,
                userId,
                "Interview request initiated");

        // Save changes
        applicationRepository.save(application);
    }

    /**
     * Creates and publishes an interview request event.
     */
    private void publishInterviewRequestEvent(Application application, String userId) {
        InterviewRequestedEvent event = InterviewRequestedEvent.builder()
                .applicationId(application.getId())
                .applicationReference(application.getReference())
                .candidateId(application.getCandidateId())
                .candidateName(application.getCandidateName())
                .jobPostingId(application.getJobPostingId())
                .jobTitle(application.getJobTitle())
                .jobDepartment(application.getJobDepartment())
                .requesterUsername(userId)
                .requestedAt(LocalDateTime.now())
                .build();

        // Publish event via outbox pattern
        createOutboxEvent("application", application.getId(), "InterviewRequested", event);
    }

    /**
     * Creates an interview via interview service and sends notification.
     */
    private ApplicationDTO.DetailResponse createInterviewAndNotify(Application application, String userId) {
        Application finalApplication = application;
        return interviewServiceClient.requestInterview(InterviewServiceClient.InterviewRequestDTO.builder()
                        .applicationId(application.getId())
                        .applicationReference(application.getReference())
                        .candidateId(application.getCandidateId())
                        .candidateName(application.getCandidateName())
                        .jobPostingId(application.getJobPostingId())
                        .jobTitle(application.getJobTitle())
                        .requestedBy(userId)
                        .build())
                .flatMap(interviewId -> {
                    // Update interview ID
                    finalApplication.setInterviewId(interviewId);
                    Application updatedApplication = applicationRepository.save(finalApplication);
                    log.info("Interview created successfully with ID: {}", interviewId);

                    // Send notification to candidate
                    notificationService.sendInterviewRequestedNotification(updatedApplication);

                    // Get updated details
                    return Mono.just(getApplicationDetails(updatedApplication.getId()));
                })
                .onErrorResume(error -> {
                    log.error("Failed to create interview synchronously, relying on asynchronous event: {}", error.getMessage());
                    // Send notification to candidate despite error
                    notificationService.sendInterviewRequestedNotification(application);
                    return Mono.just(getApplicationDetails(application.getId()));
                })
                .block();
    }

    /**
     * Gets statistics for a job posting.
     *
     * @param jobPostingId The job posting ID
     * @return The job posting statistics
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'job-stats-' + #jobPostingId")
    public ApplicationDTO.JobPostingStatsDTO getJobPostingStats(Long jobPostingId) {
        log.debug("Getting stats for job posting {}", jobPostingId);

        // Get applications for this job
        List<Application> applications = applicationRepository.findAllByJobPostingId(jobPostingId);

        if (applications.isEmpty()) {
            return ApplicationDTO.JobPostingStatsDTO.builder()
                    .jobId(jobPostingId)
                    .totalApplications(0)
                    .statusCounts(new HashMap<>())
                    .build();
        }

        // Get job info and calculate statistics
        return calculateJobPostingStats(jobPostingId, applications);
    }

    /**
     * Calculates statistics for a job posting.
     */
    private ApplicationDTO.JobPostingStatsDTO calculateJobPostingStats(Long jobPostingId, List<Application> applications) {
        // Get job posting details
        JobPostingDTO jobPosting = jobPostingServiceClient.getJobPosting(jobPostingId)
                .onErrorResume(e -> {
                    log.error("Error retrieving job posting: {}", e.getMessage());
                    return Mono.empty();
                })
                .block();

        // Count by status
        Map<String, Integer> statusCounts = applications.stream()
                .collect(Collectors.groupingBy(
                        app -> app.getStatus().name(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        // Calculate average score
        double averageScore = applications.stream()
                .filter(app -> app.getAiScore() != null)
                .mapToDouble(Application::getAiScore)
                .average()
                .orElse(0.0);

        // Calculate average processing time
        double averageTimeToProcess = applications.stream()
                .filter(app -> app.getProcessedAt() != null && app.getSubmittedAt() != null)
                .mapToLong(app -> ChronoUnit.HOURS.between(app.getSubmittedAt(), app.getProcessedAt()))
                .average()
                .orElse(0.0);

        // Calculate conversion rate (shortlisted / total)
        long shortlistedCount = applications.stream()
                .filter(this::isApplicationInAdvancedStage)
                .count();

        double conversionRate = applications.isEmpty() ? 0.0 :
                (double) shortlistedCount / applications.size() * 100;

        // Analyze most common skill gaps (simplified example)
        List<String> topSkillsGaps = List.of("JavaScript", "Spring Boot", "React", "Docker", "Kubernetes");

        // Build response
        return ApplicationDTO.JobPostingStatsDTO.builder()
                .jobId(jobPostingId)
                .jobTitle(jobPosting != null ? jobPosting.getTitle() : "Job #" + jobPostingId)
                .totalApplications(applications.size())
                .statusCounts(statusCounts)
                .averageScore(averageScore)
                .conversionRate(conversionRate)
                .averageTimeToProcess((int) averageTimeToProcess)
                .topSkillsGaps(topSkillsGaps)
                .build();
    }

    /**
     * Checks if an application is in an advanced stage (shortlisted or beyond).
     */
    private boolean isApplicationInAdvancedStage(Application app) {
        return app.getStatus() == ApplicationStatus.SHORTLISTED ||
                app.getStatus() == ApplicationStatus.INTERVIEW_REQUESTED ||
                app.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED ||
                app.getStatus() == ApplicationStatus.INTERVIEW_COMPLETED ||
                app.getStatus() == ApplicationStatus.OFFER_EXTENDED ||
                app.getStatus() == ApplicationStatus.HIRED;
    }

    /**
     * Gets data for the HR dashboard.
     *
     * @return The dashboard data
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'dashboard-data'")
    public ApplicationDTO.DashboardSummary getDashboardData() {
        log.debug("Getting dashboard data");

        // Basic statistics
        long totalApplications = applicationRepository.count();

        // Count applications by status
        long pendingApplications = countApplications(SearchCriteriaDTO.builder()
                .statuses(Set.of(ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW))
                .build());

        long shortlistedApplications = countApplications(SearchCriteriaDTO.builder()
                .statuses(Set.of(ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW_REQUESTED,
                        ApplicationStatus.INTERVIEW_SCHEDULED))
                .build());

        long rejectedApplications = countApplications(SearchCriteriaDTO.builder()
                .statuses(Set.of(ApplicationStatus.REJECTED))
                .build());

        // Get alerts and top jobs
        List<ApplicationDTO.DashboardAlert> alerts = generateDashboardAlerts();


        return ApplicationDTO.DashboardSummary.builder()
                .totalApplications((int) totalApplications)
                .pendingApplications((int) pendingApplications)
                .shortlistedApplications((int) shortlistedApplications)
                .rejectedApplications((int) rejectedApplications)
                .alerts(alerts)

                .build();
    }

    /**
     * Generates alerts for the dashboard.
     */
    private List<ApplicationDTO.DashboardAlert> generateDashboardAlerts() {
        List<ApplicationDTO.DashboardAlert> alerts = new ArrayList<>();

        // Alert: Exceptional candidates
        List<Application> highScoreApplications = applicationRepository.findHighScoringRecentApplications(
                ApplicationStatus.UNDER_REVIEW, 90.0, LocalDateTime.now().minusDays(7));

        if (!highScoreApplications.isEmpty()) {
            for (Application app : highScoreApplications) {
                alerts.add(ApplicationDTO.DashboardAlert.builder()
                        .type("INFO")
                        .message("Exceptional candidate: " + app.getCandidateName() +
                                " (" + app.getAiScore() + "/100) for " + app.getJobTitle())
                        .recommendation("Schedule interview quickly")
                        .build());
            }
        }

        // Alert: Applications pending too long
        List<Application> staleApplications = applicationRepository.findStaleApplications(
                ApplicationStatus.UNDER_REVIEW, LocalDateTime.now().minusDays(5));

        if (!staleApplications.isEmpty()) {
            alerts.add(ApplicationDTO.DashboardAlert.builder()
                    .type("WARNING")
                    .message(staleApplications.size() + " applications pending for >5 days")
                    .recommendation("Prioritize overdue evaluations")
                    .build());
        }

        return alerts;
    }


    /**
     * Determines the job title from available sources.
     */
    private String determineJobTitle(Long jobId, List<Application> apps, Map<Long, JobPostingDTO> jobPostings) {
        // Default title
        String jobTitle = "Job #" + jobId;

        // Try to get from job postings map
        if (jobPostings != null && jobPostings.containsKey(jobId)) {
            JobPostingDTO job = jobPostings.get(jobId);
            if (job != null && job.getTitle() != null) {
                jobTitle = job.getTitle();
            }
        }
        // Or from application if available
        else if (!apps.isEmpty() && apps.get(0).getJobTitle() != null) {
            jobTitle = apps.get(0).getJobTitle();
        }

        return jobTitle;
    }

    /**
     * Count applications matching a criteria.
     *
     * @param criteria The search criteria
     * @return The count of matching applications
     */
    private long countApplications(SearchCriteriaDTO criteria) {
        Specification<Application> spec = buildSearchSpecification(criteria);
        return applicationRepository.count(spec);
    }

    /**
     * Gets application summaries for a job posting.
     *
     * @param jobPostingId The job posting ID
     * @return The list of application summaries
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'job-summaries-' + #jobPostingId")
    public List<ApplicationDTO.SummaryResponse> getApplicationSummariesByJob(Long jobPostingId) {
        log.debug("Getting application summaries for job posting {}", jobPostingId);

        List<Application> applications = applicationRepository.findAllByJobPostingId(jobPostingId);
        return applicationMapper.toSummaryResponseList(applications);
    }

    /**
     * Gets application summaries for a candidate.
     *
     * @param candidateId The candidate ID
     * @return The list of application summaries
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'candidate-summaries-' + #candidateId")
    public List<ApplicationDTO.SummaryResponse> getApplicationSummariesByCandidate(String candidateId) {
        log.debug("Getting application summaries for candidate {}", candidateId);

        Page<Application> applications = applicationRepository.findByCandidateId(
                candidateId, PageRequest.of(0, 100));
        return applicationMapper.toSummaryResponseList(applications.getContent());
    }

    /**
     * Updates the status of an application from an external service.
     *
     * @param applicationId The application ID
     * @param statusString The status to apply
     * @param reason The reason for the change
     * @return The updated application summary
     */
    @Transactional
    @CacheEvict(cacheNames = {"applications"}, allEntries = true)
    public ApplicationDTO.SummaryResponse updateStatusFromExternalService(
            Long applicationId, String statusString, String reason) {

        log.debug("Updating status from external service for application {} to {}",
                applicationId, statusString);

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        try {
            ApplicationStatus newStatus = ApplicationStatus.valueOf(statusString);

            // Check if status transition is valid
            validateStatusTransition(application.getStatus(), newStatus);

            // Save previous status
            ApplicationStatus previousStatus = application.getStatus();

            // Update the application status
            updateExternalServiceStatus(application, newStatus, reason);

            // Create event for notification
            ApplicationStatusChangedEvent event = ApplicationStatusChangedEvent.builder()
                    .applicationId(application.getId())
                    .reference(application.getReference())
                    .candidateId(application.getCandidateId())
                    .jobPostingId(application.getJobPostingId())
                    .previousStatus(previousStatus)
                    .newStatus(application.getStatus())
                    .changedAt(LocalDateTime.now())
                    .changedBy("SYSTEM")
                    .isSystemChange(true)
                    .isAutomaticDecision(false)
                    .candidateName(application.getCandidateName())
                    .jobTitle(application.getJobTitle())
                    .build();

            // Publish event via outbox pattern
            createOutboxEvent("application", application.getId(), "ApplicationStatusChanged", event);

            // Send notification if necessary
            sendStatusChangeNotifications(application, newStatus);

            return applicationMapper.toSummaryResponse(application);

        } catch (IllegalArgumentException e) {
            throw new InvalidOperationException("Invalid status: " + statusString);
        }
    }

    /**
     * Updates an application's status from an external service.
     */
    private void updateExternalServiceStatus(Application application, ApplicationStatus newStatus, String reason) {
        // Update status
        application.setStatus(newStatus);
        application.setLastStatusChangedAt(LocalDateTime.now());
        application.setLastStatusChangedBy("SYSTEM");
        application.setUpdatedAt(LocalDateTime.now());
        application.setUpdatedBy("SYSTEM");

        // Handle specific statuses
        if (newStatus == ApplicationStatus.SHORTLISTED) {
            application.setIsShortlisted(true);
        } else if (newStatus == ApplicationStatus.REJECTED) {
            application.setIsShortlisted(false);
        }

        // Add entry to history
        application.addStatusHistoryEntry(
                application.getStatus(),
                newStatus,
                "SYSTEM",
                reason != null ? reason : "Update from external service: " + newStatus);

        // If application is accepted or rejected, update processing date
        if (newStatus == ApplicationStatus.SHORTLISTED || newStatus == ApplicationStatus.REJECTED) {
            if (application.getProcessedAt() == null) {
                application.setProcessedAt(LocalDateTime.now());
            }
        }

        // Save changes
        applicationRepository.save(application);
    }

    /**
     * Sends notifications for status changes when needed.
     */
    private void sendStatusChangeNotifications(Application application, ApplicationStatus newStatus) {
        if (newStatus == ApplicationStatus.SHORTLISTED) {
            notificationService.sendApplicationShortlistedNotification(application);
        } else if (newStatus == ApplicationStatus.REJECTED) {
            notificationService.sendApplicationRejectedNotification(application);
        }
    }

    /**
     * Updates the interview status for an application.
     *
     * @param applicationId The application ID
     * @param interviewId The interview ID
     * @param interviewStatus The interview status
     * @return The updated application summary
     */
    @Transactional
    @CacheEvict(cacheNames = {"applications"}, allEntries = true)
    public ApplicationDTO.SummaryResponse updateInterviewStatus(
            Long applicationId, Long interviewId, String interviewStatus) {

        log.debug("Updating interview status for application {} to {}", applicationId, interviewStatus);

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Validate interview ID
        validateInterviewId(application, interviewId);

        // Store interview ID if not defined yet
        if (application.getInterviewId() == null) {
            application.setInterviewId(interviewId);
        }

        // Process the status update
        ApplicationStatus previousStatus = application.getStatus();
        ApplicationStatus newStatus = determineApplicationStatusFromInterviewStatus(interviewStatus);

        // Update application status
        application.setStatus(newStatus);
        application.setLastStatusChangedAt(LocalDateTime.now());
        application.setLastStatusChangedBy("INTERVIEW_SERVICE");
        application.setUpdatedAt(LocalDateTime.now());
        application.setUpdatedBy("INTERVIEW_SERVICE");

        // Add entry to history
        application.addStatusHistoryEntry(
                previousStatus,
                newStatus,
                "INTERVIEW_SERVICE",
                "Interview status update: " + interviewStatus);

        // Save changes
        application = applicationRepository.save(application);

        // Create and publish event
        ApplicationStatusChangedEvent event = ApplicationStatusChangedEvent.builder()
                .applicationId(application.getId())
                .reference(application.getReference())
                .candidateId(application.getCandidateId())
                .jobPostingId(application.getJobPostingId())
                .previousStatus(previousStatus)
                .newStatus(application.getStatus())
                .changedAt(LocalDateTime.now())
                .changedBy("INTERVIEW_SERVICE")
                .isSystemChange(true)
                .isAutomaticDecision(false)
                .candidateName(application.getCandidateName())
                .jobTitle(application.getJobTitle())
                .build();

        createOutboxEvent("application", application.getId(), "ApplicationStatusChanged", event);

        // Send notification if necessary
        if (newStatus == ApplicationStatus.INTERVIEW_SCHEDULED) {
            notificationService.sendInterviewScheduledNotification(application);
        }

        return applicationMapper.toSummaryResponse(application);
    }

    /**
     * Validates that the interview ID matches the application's interview ID.
     */
    private void validateInterviewId(Application application, Long interviewId) {
        if (application.getInterviewId() != null && !application.getInterviewId().equals(interviewId)) {
            throw new InvalidOperationException("Interview ID does not match application's interview ID");
        }
    }

    /**
     * Determines the application status based on the interview status.
     */
    private ApplicationStatus determineApplicationStatusFromInterviewStatus(String interviewStatus) {
        switch (interviewStatus.toUpperCase()) {
            case "SCHEDULED":
                return ApplicationStatus.INTERVIEW_SCHEDULED;
            case "COMPLETED":
                return ApplicationStatus.INTERVIEW_COMPLETED;
            case "CANCELED":
                // Revert to SHORTLISTED if interview is canceled
                return ApplicationStatus.SHORTLISTED;
            default:
                throw new InvalidOperationException("Unsupported interview status: " + interviewStatus);
        }
    }

    /**
     * Gets the current status of an application.
     *
     * @param applicationId The application ID
     * @return The current status
     */
    @Transactional(readOnly = true)
    public ApplicationStatus getCurrentStatus(Long applicationId) {
        log.debug("Getting current status for application {}", applicationId);

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        return application.getStatus();
    }

    /**
     * Gets metrics for a job posting for internal service.
     *
     * @param jobPostingId The job posting ID
     * @return A map of metrics
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'job-metrics-' + #jobPostingId")
    public Map<String, Object> getJobMetricsForInternalService(Long jobPostingId) {
        log.debug("Getting metrics for job posting {} for internal service", jobPostingId);

        // Get applications for this job
        List<Application> applications = applicationRepository.findAllByJobPostingId(jobPostingId);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("jobPostingId", jobPostingId);
        metrics.put("totalApplications", applications.size());

        // Add metrics
        addStatusMetrics(metrics, applications);
        addScoreMetrics(metrics, applications);
        addConversionMetrics(metrics, applications);
        addLatestApplicationMetrics(metrics, applications);

        return metrics;
    }

    /**
     * Adds status count metrics.
     */
    private void addStatusMetrics(Map<String, Object> metrics, List<Application> applications) {
        // Count by status
        Map<String, Long> statusCounts = applications.stream()
                .collect(Collectors.groupingBy(
                        app -> app.getStatus().name(),
                        Collectors.counting()
                ));
        metrics.put("statusCounts", statusCounts);
    }

    /**
     * Adds score metrics.
     */
    private void addScoreMetrics(Map<String, Object> metrics, List<Application> applications) {
        // Calculate average score
        OptionalDouble avgScore = applications.stream()
                .filter(app -> app.getAiScore() != null)
                .mapToDouble(Application::getAiScore)
                .average();

        metrics.put("averageScore", avgScore.isPresent() ? avgScore.getAsDouble() : 0.0);
    }

    /**
     * Adds conversion rate metrics.
     */
    private void addConversionMetrics(Map<String, Object> metrics, List<Application> applications) {
        // Calculate conversion rate
        long shortlistedCount = applications.stream()
                .filter(this::isApplicationInAdvancedStage)
                .count();

        double conversionRate = applications.isEmpty() ? 0.0 :
                (double) shortlistedCount / applications.size() * 100;
        metrics.put("conversionRate", conversionRate);
    }

    /**
     * Adds latest application metrics.
     */
    private void addLatestApplicationMetrics(Map<String, Object> metrics, List<Application> applications) {
        // Latest application
        Optional<Application> latestApp = applications.stream()
                .max(Comparator.comparing(Application::getSubmittedAt));

        if (latestApp.isPresent()) {
            metrics.put("latestApplicationDate", latestApp.get().getSubmittedAt());
        }
    }

    /**
     * Processes an application submission from an external service.
     *
     * @param event The submission event
     * @return The created application response
     */
    @Transactional
    public ApplicationDTO.CreateResponse processExternalSubmission(ApplicationSubmittedEvent event) {
        log.debug("Processing external submission for candidate {} for job {}",
                event.getCandidateId(), event.getJobPostingId());

        // Check if application already exists
        Optional<Application> existingApplication = applicationRepository
                .findByCandidateIdAndJobPostingId(event.getCandidateId(), event.getJobPostingId());

        if (existingApplication.isPresent()) {
            Application existing = existingApplication.get();

            // If application already exists, return its information
            return ApplicationDTO.CreateResponse.builder()
                    .id(existing.getId())
                    .reference(existing.getReference())
                    .status(existing.getStatus())
                    .submittedAt(existing.getSubmittedAt())
                    .build();
        }

        // Get candidate and job posting info in parallel
        return candidateServiceClient.getCandidateProfile(event.getCandidateId())
                .switchIfEmpty(Mono.error(new InvalidOperationException("Candidate profile not found")))
                .zipWith(jobPostingServiceClient.getJobPosting(event.getJobPostingId())
                        .switchIfEmpty(Mono.error(new InvalidOperationException("Job posting not found"))))
                .flatMap(tuple -> processExternalApplicationCreation(tuple, event))
                .onErrorMap(e -> {
                    if (e instanceof InvalidOperationException || e instanceof ResourceNotFoundException) {
                        return e;
                    }
                    log.error("Unexpected error during external submission", e);
                    return new InvalidOperationException("Error creating application: " + e.getMessage());
                })
                .block();
    }



    /**
     * Processes the creation of an application from an external submission.
     */
    private Mono<ApplicationDTO.CreateResponse> processExternalApplicationCreation(
            Tuple2<CandidateProfileDTO, JobPostingDTO> tuple, ApplicationSubmittedEvent event) {

        CandidateProfileDTO candidateProfile = tuple.getT1();
        JobPostingDTO jobPosting = tuple.getT2();

        // Validate profile completeness
        if (!isProfileComplete(candidateProfile)) {
            return Mono.error(new InvalidOperationException(
                    "Candidate profile must be completed before submitting an application"));
        }

        // Validate job is open
        if (!"PUBLISHED".equals(jobPosting.getStatus())) {
            return Mono.error(new InvalidOperationException(
                    "This job posting is no longer open for applications"));
        }

        // Create and save application
        Application application = createExternalApplicationEntity(event, candidateProfile, jobPosting);
        application = applicationRepository.save(application);
        final Application savedApplication = application; // Final copy for lambda

        // Handle events and notifications
        handleExternalApplicationCreation(application, event);

        // Trigger AI evaluation asynchronously if resume is provided
        if (event.getResumeDocumentId() != null) {
            CompletableFuture.runAsync(() -> triggerAIEvaluation(savedApplication), aiTaskExecutor);
        }

        // Build and return response
        return Mono.just(ApplicationDTO.CreateResponse.builder()
                .id(application.getId())
                .reference(application.getReference())
                .status(application.getStatus())
                .submittedAt(application.getSubmittedAt())
                .build());
    }

    /**
     * Creates an application entity from an external submission event.
     */
    private Application createExternalApplicationEntity(
            ApplicationSubmittedEvent event, CandidateProfileDTO candidateProfile, JobPostingDTO jobPosting) {

        // Generate unique reference
        String reference = referenceGenerator.generateReference(event.getJobPostingId());
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime submittedTime = event.getSubmittedAt() != null ? event.getSubmittedAt() : now;

        // Create application entity
        Application application = Application.builder()
                .reference(reference)
                .candidateId(event.getCandidateId())
                .jobPostingId(event.getJobPostingId())
                .resumeDocumentId(event.getResumeDocumentId())
                .coverLetterDocumentId(event.getCoverLetterDocumentId())
                .status(ApplicationStatus.SUBMITTED)
                .candidateMessage(event.getCandidateMessage())
                .candidateName(event.getCandidateName() != null ?
                        event.getCandidateName() : getFullName(candidateProfile))
                .jobTitle(event.getJobTitle() != null ?
                        event.getJobTitle() : jobPosting.getTitle())
                .jobDepartment(jobPosting.getDepartment())
                .aiProcessed(false)
                .autoDecision(false)
                .isShortlisted(false)
                .submittedAt(submittedTime)
                .lastStatusChangedAt(now)
                .createdAt(now)
                .createdBy(event.getCandidateId())
                .build();

        // Add initial history entry
        application.addStatusHistoryEntry(
                null,
                ApplicationStatus.SUBMITTED,
                event.getCandidateId(),
                "Application submitted via external service");

        return application;
    }

    /**
     * Handles events and notifications for an external application creation.
     */
    private void handleExternalApplicationCreation(Application application, ApplicationSubmittedEvent event) {
        // Create event for notification
        ApplicationCreatedEvent createdEvent = ApplicationCreatedEvent.builder()
                .applicationId(application.getId())
                .reference(application.getReference())
                .candidateId(application.getCandidateId())
                .jobPostingId(application.getJobPostingId())
                .status(application.getStatus())
                .createdAt(application.getSubmittedAt())
                .candidateName(application.getCandidateName())
                .jobTitle(application.getJobTitle())
                .build();

        // Publish event via outbox pattern
        createOutboxEvent("application", application.getId(), "ApplicationCreated", createdEvent);

        // Send notification to candidate
        notificationService.sendApplicationSubmittedNotification(application);
    }

    /**
     * Synchronizes an external status change.
     *
     * @param event The status change event
     */
    @Transactional
    @CacheEvict(cacheNames = {"applications"}, allEntries = true)
    public void syncExternalStatusChange(ApplicationStatusChangedEvent event) {
        log.debug("Syncing external status change for application {}: {} -> {}",
                event.getApplicationId(), event.getPreviousStatus(), event.getNewStatus());

        // Check if application exists
        Optional<Application> optionalApplication = applicationRepository.findById(event.getApplicationId());
        if (optionalApplication.isEmpty()) {
            log.warn("Cannot sync status change for non-existent application: {}", event.getApplicationId());
            return;
        }

        Application application = optionalApplication.get();

        // Check if current status matches expected previous status
        if (application.getStatus() != event.getPreviousStatus()) {
            log.warn("Status mismatch for application {}: expected {}, found {}",
                    event.getApplicationId(), event.getPreviousStatus(), application.getStatus());
            return;
        }

        // Update status
        application.setStatus(event.getNewStatus());
        application.setLastStatusChangedAt(event.getChangedAt());
        application.setLastStatusChangedBy(event.getChangedBy());
        application.setUpdatedAt(LocalDateTime.now());
        application.setUpdatedBy("SYSTEM");

        // Add entry to history
        application.addStatusHistoryEntry(
                event.getPreviousStatus(),
                event.getNewStatus(),
                event.getChangedBy(),
                "External status change sync");

        // Save changes
        applicationRepository.save(application);
        log.info("Successfully synced external status change for application {}", event.getApplicationId());
    }

    /**
     * Handle interview scheduled event.
     *
     * @param event The event data
     */
    @Transactional
    @CacheEvict(cacheNames = {"applications"}, allEntries = true)
    public void processInterviewScheduled(InterviewScheduledEvent event) {
        log.debug("Processing interview scheduled event for application {}", event.getApplicationId());

        Application application = applicationRepository.findById(event.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + event.getApplicationId()));

        // Store interview ID if not defined yet
        if (application.getInterviewId() == null && event.getInterviewId() != null) {
            application.setInterviewId(event.getInterviewId());
        }

        // Update application status if it's in INTERVIEW_REQUESTED state
        if (application.getStatus() == ApplicationStatus.INTERVIEW_REQUESTED) {
            // Update status
            ApplicationStatus previousStatus = application.getStatus();
            updateApplicationForScheduledInterview(application, event);

            // Save changes
            application = applicationRepository.save(application);

            // Send notification
            notificationService.sendInterviewScheduledNotification(application);
        } else {
            log.warn("Application {} is not in INTERVIEW_REQUESTED state, cannot process interview scheduled event",
                    event.getApplicationId());
        }
    }

    /**
     * Updates an application for a scheduled interview.
     */
    private void updateApplicationForScheduledInterview(Application application, InterviewScheduledEvent event) {
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        application.setLastStatusChangedAt(event.getScheduledAt());
        application.setLastStatusChangedBy("INTERVIEW_SERVICE");
        application.setUpdatedAt(LocalDateTime.now());
        application.setUpdatedBy("SYSTEM");

        // Add entry to history
        application.addStatusHistoryEntry(
                ApplicationStatus.INTERVIEW_REQUESTED,
                ApplicationStatus.INTERVIEW_SCHEDULED,
                "INTERVIEW_SERVICE",
                "Interview scheduled at " + event.getInterviewDateTime().toString());
    }

    /**
     * Handle interview completed event.
     *
     * @param event The event data
     */
    @Transactional
    @CacheEvict(cacheNames = {"applications"}, allEntries = true)
    public void processInterviewCompleted(InterviewCompletedEvent event) {
        log.debug("Processing interview completed event for application {}", event.getApplicationId());

        Application application = applicationRepository.findById(event.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + event.getApplicationId()));

        // Store interview ID if not defined yet
        if (application.getInterviewId() == null && event.getInterviewId() != null) {
            application.setInterviewId(event.getInterviewId());
        }

        // Update application status if it's in INTERVIEW_SCHEDULED state
        if (application.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED) {
            // Update status
            ApplicationStatus previousStatus = application.getStatus();
            updateApplicationForCompletedInterview(application, event);

            // Save changes
            application = applicationRepository.save(application);

            // Send notification
            notificationService.sendInterviewCompletedNotification(application);
        } else {
            log.warn("Application {} is not in INTERVIEW_SCHEDULED state, cannot process interview completed event",
                    event.getApplicationId());
        }
    }

    /**
     * Updates an application for a completed interview.
     */
    private void updateApplicationForCompletedInterview(Application application, InterviewCompletedEvent event) {
        application.setStatus(ApplicationStatus.INTERVIEW_COMPLETED);
        application.setLastStatusChangedAt(event.getCompletedAt());
        application.setLastStatusChangedBy("INTERVIEW_SERVICE");
        application.setUpdatedAt(LocalDateTime.now());
        application.setUpdatedBy("SYSTEM");

        // Create history message
        String historyMessage = "Interview completed";
        if (event.getIsRecommended() != null) {
            historyMessage += event.getIsRecommended() ?
                    " with positive recommendation" : " with negative recommendation";
        }

        // Add entry to history
        application.addStatusHistoryEntry(
                ApplicationStatus.INTERVIEW_SCHEDULED,
                ApplicationStatus.INTERVIEW_COMPLETED,
                "INTERVIEW_SERVICE",
                historyMessage);
    }

    /**
     * Handle interview canceled event.
     *
     * @param event The event data
     */
    @Transactional
    @CacheEvict(cacheNames = {"applications"}, allEntries = true)
    public void processInterviewCanceled(InterviewCanceledEvent event) {
        log.debug("Processing interview canceled event for application {}", event.getApplicationId());

        Application application = applicationRepository.findById(event.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + event.getApplicationId()));

        // Only process if application is in interview-related state
        if (application.getStatus() == ApplicationStatus.INTERVIEW_REQUESTED ||
                application.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED) {

            ApplicationStatus previousStatus = application.getStatus();
            updateApplicationForCanceledInterview(application, event);

            // Save changes
            application = applicationRepository.save(application);

            // Send notification
            notificationService.sendInterviewCanceledNotification(application);
        } else {
            log.warn("Application {} is not in interview state, cannot process interview canceled event",
                    event.getApplicationId());
        }
    }

    /**
     * Updates an application for a canceled interview.
     */
    private void updateApplicationForCanceledInterview(Application application, InterviewCanceledEvent event) {
        application.setStatus(ApplicationStatus.SHORTLISTED); // Revert to shortlisted
        application.setLastStatusChangedAt(event.getCanceledAt());
        application.setLastStatusChangedBy("INTERVIEW_SERVICE");
        application.setUpdatedAt(LocalDateTime.now());
        application.setUpdatedBy("SYSTEM");

        // Add entry to history
        application.addStatusHistoryEntry(
                application.getStatus(),
                ApplicationStatus.SHORTLISTED,
                "INTERVIEW_SERVICE",
                "Interview canceled: " + event.getReason());
    }

    /**
     * Checks if a candidate profile is complete and has all required fields.
     *
     * @param candidateProfile The candidate profile to check
     * @return true if the profile is complete
     */
    private boolean isProfileComplete(CandidateProfileDTO candidateProfile) {
        if (candidateProfile == null) {
            return false;
        }

        // Check personal info
        if (candidateProfile.getPersonalInfo() == null ||
                StringUtils.isEmpty(candidateProfile.getPersonalInfo().getFirstName()) ||
                StringUtils.isEmpty(candidateProfile.getPersonalInfo().getLastName()) ||
                StringUtils.isEmpty(candidateProfile.getPersonalInfo().getEmail()) ||
                StringUtils.isEmpty(candidateProfile.getPersonalInfo().getPhone())) {
            return false;
        }

        // Check for at least one experience
        if (candidateProfile.getExperiences() == null || candidateProfile.getExperiences().isEmpty()) {
            return false;
        }

        // Check for at least one education entry
        if (candidateProfile.getEducationHistory() == null || candidateProfile.getEducationHistory().isEmpty()) {
            return false;
        }

        // Check for skills
        if (candidateProfile.getSkills() == null || candidateProfile.getSkills().isEmpty()) {
            return false;
        }

        return true;
    }

    /**
     * Gets the full name from a candidate profile.
     *
     * @param candidateProfile The candidate profile
     * @return The full name
     */
    private String getFullName(CandidateProfileDTO candidateProfile) {
        if (candidateProfile == null) {
            return "Unknown Candidate";
        }

        if (candidateProfile.getPersonalInfo() != null) {
            String firstName = candidateProfile.getPersonalInfo().getFirstName();
            String lastName = candidateProfile.getPersonalInfo().getLastName();
            return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
        }

        return candidateProfile.getName() != null ? candidateProfile.getName() : "Unknown Candidate";
    }

    /**
     * Gets the documents for an application.
     *
     * @param application The application
     * @return The list of documents
     */
    private Mono<List<DocumentDTO>> getApplicationDocuments(Application application) {
        List<DocumentDTO> documents = new ArrayList<>();
        List<Mono<DocumentDTO>> documentMonos = new ArrayList<>();

        // Add resume if present
        if (application.getResumeDocumentId() != null) {
            documentMonos.add(documentServiceClient.getDocument(application.getResumeDocumentId()));
        }

        // Add cover letter if present
        if (application.getCoverLetterDocumentId() != null) {
            documentMonos.add(documentServiceClient.getDocument(application.getCoverLetterDocumentId()));
        }

        if (documentMonos.isEmpty()) {
            return Mono.just(documents);
        }

        return Flux.fromIterable(documentMonos)
                .flatMap(mono -> mono)
                .collectList();
    }

    /**
     * Enriches candidate views with additional data.
     *
     * @param candidateViews The candidate views to enrich
     */
    private void enrichCandidateViews(List<ApplicationDTO.CandidateView> candidateViews) {
        // Skip if empty
        if (candidateViews.isEmpty()) {
            return;
        }

        // For each view, enrich with documents and interview details
        candidateViews.forEach(view -> {
            // Find the application by id
            applicationRepository.findById(view.getId()).ifPresent(application -> {
                // Enrich with documents
                enrichWithDocuments(view, application);

                // Enrich with interview details if applicable
                enrichWithInterviewDetails(view, application);
            });
        });
    }

    /**
     * Enriches a candidate view with document information.
     *
     * @param view The view to enrich
     * @param application The application
     */
    private void enrichWithDocuments(ApplicationDTO.CandidateView view, Application application) {
        List<DocumentDTO> documents = new ArrayList<>();

        // If resume exists, add it
        if (application.getResumeDocumentId() != null) {
            try {
                DocumentDTO resume = documentServiceClient.getDocument(application.getResumeDocumentId())
                        .block(Duration.ofSeconds(5));
                if (resume != null) {
                    documents.add(resume);
                }
            } catch (Exception e) {
                log.warn("Error retrieving resume document for application {}: {}",
                        application.getId(), e.getMessage());
            }
        }

        // If cover letter exists, add it
        if (application.getCoverLetterDocumentId() != null) {
            try {
                DocumentDTO coverLetter = documentServiceClient.getDocument(application.getCoverLetterDocumentId())
                        .block(Duration.ofSeconds(5));
                if (coverLetter != null) {
                    documents.add(coverLetter);
                }
            } catch (Exception e) {
                log.warn("Error retrieving cover letter document for application {}: {}",
                        application.getId(), e.getMessage());
            }
        }

        view.setDocuments(documents);
    }

    /**
     * Enriches a detail response with document information.
     *
     * @param detailResponse The response to enrich
     * @param application The application
     */
    private void enrichWithDetailDocuments(ApplicationDTO.DetailResponse detailResponse, Application application) {
        // If resume exists, add it
        if (application.getResumeDocumentId() != null) {
            try {
                DocumentDTO resume = documentServiceClient.getDocument(application.getResumeDocumentId())
                        .block(Duration.ofSeconds(5));
                if (resume != null) {
                    detailResponse.setResume(resume);
                }
            } catch (Exception e) {
                log.warn("Error retrieving resume document for application {}: {}",
                        application.getId(), e.getMessage());
            }
        }

        // If cover letter exists, add it
        if (application.getCoverLetterDocumentId() != null) {
            try {
                DocumentDTO coverLetter = documentServiceClient.getDocument(application.getCoverLetterDocumentId())
                        .block(Duration.ofSeconds(5));
                if (coverLetter != null) {
                    detailResponse.setCoverLetter(coverLetter);
                }
            } catch (Exception e) {
                log.warn("Error retrieving cover letter document for application {}: {}",
                        application.getId(), e.getMessage());
            }
        }
    }

    /**
     * Enriches a candidate view with interview details.
     *
     * @param view The view to enrich
     * @param application The application
     */
    private void enrichWithInterviewDetails(ApplicationDTO.CandidateView view, Application application) {
        // Only check for interview details if an interview ID exists
        if (application.getInterviewId() != null) {
            try {
                InterviewDetailDTO interviewDetails = interviewServiceClient.getInterviewDetails(application.getInterviewId())
                        .block(Duration.ofSeconds(5));
                if (interviewDetails != null) {
                    view.setInterviewDetails(interviewDetails);
                }
            } catch (Exception e) {
                log.warn("Error retrieving interview details for application {}: {}",
                        application.getId(), e.getMessage());
            }
        }
    }

    /**
     * Builds a JPA Specification for searching applications based on criteria.
     *
     * @param criteria The search criteria
     * @return The specification
     */
    private Specification<Application> buildSearchSpecification(SearchCriteriaDTO criteria) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Add candidate ID filter
            if (StringUtils.hasText(criteria.getCandidateId())) {
                predicates.add(builder.equal(root.get("candidateId"), criteria.getCandidateId()));
            }

            // Add job posting ID filter
            if (criteria.getJobPostingId() != null) {
                predicates.add(builder.equal(root.get("jobPostingId"), criteria.getJobPostingId()));
            }

            // Add job title filter
            if (StringUtils.hasText(criteria.getJobTitle())) {
                predicates.add(builder.like(
                        builder.lower(root.get("jobTitle")),
                        "%" + criteria.getJobTitle().toLowerCase() + "%"
                ));
            }

            // Add department filter
            if (StringUtils.hasText(criteria.getDepartment())) {
                predicates.add(builder.equal(root.get("jobDepartment"), criteria.getDepartment()));
            }

            // Add status filter
            if (criteria.getStatuses() != null && !criteria.getStatuses().isEmpty()) {
                predicates.add(root.get("status").in(criteria.getStatuses()));
            }

            // Add AI score range filter
            if (criteria.getMinAiScore() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("aiScore"), criteria.getMinAiScore()));
            }

            if (criteria.getMaxAiScore() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("aiScore"), criteria.getMaxAiScore()));
            }

            // Add AI processed filter
            if (criteria.getAiProcessed() != null) {
                predicates.add(builder.equal(root.get("aiProcessed"), criteria.getAiProcessed()));
            }

            // Add auto decision filter
            if (criteria.getAutoDecision() != null) {
                predicates.add(builder.equal(root.get("autoDecision"), criteria.getAutoDecision()));
            }

            // Add submission date range filter
            if (criteria.getSubmittedAfter() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("submittedAt"), criteria.getSubmittedAfter()));
            }

            if (criteria.getSubmittedBefore() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("submittedAt"), criteria.getSubmittedBefore()));
            }

            // Add candidate name filter
            if (StringUtils.hasText(criteria.getCandidateName())) {
                predicates.add(builder.like(
                        builder.lower(root.get("candidateName")),
                        "%" + criteria.getCandidateName().toLowerCase() + "%"
                ));
            }

            // Add reference filter
            if (StringUtils.hasText(criteria.getReference())) {
                predicates.add(builder.like(
                        builder.lower(root.get("reference")),
                        "%" + criteria.getReference().toLowerCase() + "%"
                ));
            }

            // Add keyword search across multiple fields
            if (StringUtils.hasText(criteria.getKeyword())) {
                String keyword = "%" + criteria.getKeyword().toLowerCase() + "%";

                Predicate keywordPredicate = builder.or(
                        builder.like(builder.lower(root.get("reference")), keyword),
                        builder.like(builder.lower(root.get("candidateName")), keyword),
                        builder.like(builder.lower(root.get("jobTitle")), keyword),
                        builder.like(builder.lower(root.get("jobDepartment")), keyword),
                        builder.like(builder.lower(root.get("candidateMessage")), keyword),
                        builder.like(builder.lower(root.get("recruiterNotes")), keyword)
                );

                predicates.add(keywordPredicate);
            }

            // Add deleted filter - always exclude deleted applications
            predicates.add(builder.equal(root.get("deleted"), false));

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * User roles enum for use in findApplications method.
     */
    public enum UserRole {
        CANDIDATE,
        RH_ADMIN,
        DASHBOARD
    }
}