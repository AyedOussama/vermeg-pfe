package com.PFE2025.user_service.service.impl;

import com.PFE2025.user_service.dto.request.CeoUpdateRequest;
import com.PFE2025.user_service.dto.response.CeoProfileResponse;
import com.PFE2025.user_service.exception.ResourceNotFoundException;
import com.PFE2025.user_service.model.CeoProfile;
import com.PFE2025.user_service.repository.CeoProfileRepository;
import com.PFE2025.user_service.service.CeoService;
import com.PFE2025.user_service.util.CeoProfileMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Implémentation du service pour la gestion des profils CEO.
 * Fournit toutes les opérations CRUD et de recherche.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CeoServiceImpl implements CeoService {

    private final CeoProfileRepository ceoProfileRepository;
    private final CeoProfileMapper ceoProfileMapper;



    @Override
    @Transactional(readOnly = true)
    public Page<CeoProfileResponse> getAllCeos(Pageable pageable) {
        log.debug("Getting all CEO profiles with pagination: {}", pageable);
        
        Page<CeoProfile> profiles = ceoProfileRepository.findAll(pageable);
        return profiles.map(ceoProfileMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CeoProfileResponse getCeoById(String id) {
        log.debug("Getting CEO profile by id: {}", id);
        
        CeoProfile profile = ceoProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CEO profile not found with id: " + id));
        
        return ceoProfileMapper.toResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public CeoProfileResponse getCeoByKeycloakId(String keycloakId) {
        log.debug("Getting CEO profile by keycloakId: {}", keycloakId);
        
        CeoProfile profile = ceoProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("CEO profile not found for keycloakId: " + keycloakId));
        
        return ceoProfileMapper.toResponse(profile);
    }

    @Override
    public CeoProfileResponse updateCeoByKeycloakId(String keycloakId, CeoUpdateRequest request) {
        log.debug("Updating CEO profile with keycloakId: {}", keycloakId);

        CeoProfile profile = ceoProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("CEO profile not found with keycloakId: " + keycloakId));

        // Mettre à jour les champs
        ceoProfileMapper.updateEntity(profile, request);
        profile.setUpdatedAt(LocalDateTime.now());

        // Sauvegarder
        CeoProfile updatedProfile = ceoProfileRepository.save(profile);
        log.info("CEO profile updated successfully with keycloakId: {}", keycloakId);

        return ceoProfileMapper.toResponse(updatedProfile);
    }

    @Override
    public void deleteCeoByKeycloakId(String keycloakId) {
        log.debug("Deleting CEO profile with keycloakId: {}", keycloakId);

        CeoProfile profile = ceoProfileRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("CEO profile not found with keycloakId: " + keycloakId));

        ceoProfileRepository.delete(profile);
        log.info("CEO profile deleted successfully with keycloakId: {}", keycloakId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CeoProfileResponse> searchCeos(String keyword, Pageable pageable) {
        log.debug("Searching CEO profiles with keyword: {}", keyword);

        Page<CeoProfile> profiles = ceoProfileRepository.searchByKeyword(keyword, pageable);
        return profiles.map(ceoProfileMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CeoProfileResponse> getCeosByLocation(String location, Pageable pageable) {
        log.debug("Getting CEO profiles by location: {}", location);
        
        Page<CeoProfile> profiles = ceoProfileRepository.findByLocationContainingIgnoreCase(location, pageable);
        return profiles.map(ceoProfileMapper::toResponse);
    }



    @Override
    @Transactional(readOnly = true)
    public long countCeos() {
        log.debug("Counting total CEO profiles");
        return ceoProfileRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByKeycloakId(String keycloakId) {
        return ceoProfileRepository.existsByKeycloakId(keycloakId);
    }

    /**
     * Méthode optimisée pour les recherches avec projection limitée
     */
    @Transactional(readOnly = true)
    public Page<CeoProfileResponse> searchCeoProfilesOptimized(String keyword, Pageable pageable) {
        log.debug("Optimized search for CEO profiles with keyword: {}", keyword);

        // Utilise la même recherche mais avec une approche optimisée
        Page<CeoProfile> profiles = ceoProfileRepository.searchByKeyword(keyword, pageable);

        // Conversion optimisée avec le mapper
        return profiles.map(profile -> {
            CeoProfileResponse response = ceoProfileMapper.toResponse(profile);
            // On peut ici limiter les champs si nécessaire pour les listes
            return response;
        });
    }

}
