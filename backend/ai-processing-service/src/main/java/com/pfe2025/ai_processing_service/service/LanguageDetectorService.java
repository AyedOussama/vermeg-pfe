package com.pfe2025.ai_processing_service.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.language.detect.LanguageDetector;
import org.apache.tika.language.detect.LanguageResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import jakarta.annotation.PostConstruct; // Utiliser jakarta pour compatibilité Spring Boot 3+
import java.io.IOException;

@Service
@Slf4j
public class LanguageDetectorService {

    private LanguageDetector detector;
    private final String defaultLanguage;

    // Injecter la langue par défaut depuis application.yml
    public LanguageDetectorService(@Value("${language.detection.default:en}") String defaultLanguage) {
        this.defaultLanguage = defaultLanguage;
        log.info("Default language for detection set to: '{}'", this.defaultLanguage);
    }

    @PostConstruct
    private void initializeDetector() {
        // Initialiser le détecteur de manière asynchrone pour ne pas bloquer le démarrage
        Mono.fromCallable(() -> LanguageDetector.getDefaultLanguageDetector().loadModels())
                .subscribeOn(Schedulers.boundedElastic())
                .subscribe(
                        loadedDetector -> {
                            this.detector = loadedDetector;
                            log.info("Tika Language Detector initialized successfully.");
                        },
                        error -> log.error("Failed to initialize Tika Language Detector models.", error)
                );
    }

    /**
     * Détecte la langue d'un échantillon de texte.
     * Retourne la langue détectée (code ISO 639-1) ou la langue par défaut.
     *
     * @param textSample Un échantillon du texte (ex: les 1000 premiers caractères).
     * @return Mono<String> contenant le code de la langue.
     */
    public Mono<String> detectLanguage(String textSample) {
        if (detector == null) {
            log.warn("Language detector is not available yet (still initializing or failed). Defaulting to '{}'.", defaultLanguage);
            return Mono.just(defaultLanguage);
        }
        if (textSample == null || textSample.isBlank()) {
            log.warn("Cannot detect language from empty text sample. Defaulting to '{}'.", defaultLanguage);
            return Mono.just(defaultLanguage);
        }

        // Exécuter la détection (qui peut être CPU-intensive) sur un scheduler différent
        return Mono.fromCallable(() -> {
            // Tika LanguageDetector n'est pas forcément thread-safe, mais ici on l'utilise dans un Mono
            // qui sera exécuté par un worker du scheduler. Si plusieurs appels concurrents,
            // il faudrait peut-être synchroniser ou créer une instance par appel.
            // Cependant, la doc Tika suggère que c'est thread-safe après chargement des modèles.
            LanguageResult result = detector.detect(textSample); // Utiliser detect(String) directement
            if (result != null && result.isReasonablyCertain()) {
                log.debug("Language detected: {} (Confidence: {})", result.getLanguage(), result.getConfidence());
                return result.getLanguage();
            } else {
                String detectedLang = (result != null) ? result.getLanguage() : "unknown";
                log.warn("Language detection not reasonably certain (Detected: {}). Defaulting to '{}'.", detectedLang, defaultLanguage);
                return defaultLanguage;
            }
        }).subscribeOn(Schedulers.boundedElastic()); // Exécuter sur un pool de threads adapté
    }
}