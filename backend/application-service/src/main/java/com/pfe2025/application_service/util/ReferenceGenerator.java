package com.pfe2025.application_service.util;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * Utilitaire pour générer des références uniques pour les candidatures.
 */
@Component
public class ReferenceGenerator {

    private static final String PREFIX = "APP";
    private static final int RANDOM_CHARS = 4;
    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMdd");

    private final Random random = new Random();

    /**
     * Génère une référence unique pour une candidature.
     *
     * @param jobPostingId L'ID de l'offre d'emploi
     * @return La référence générée
     */
    public String generateReference(Long jobPostingId) {
        // Format: APP-{date}-{jobId}-{random}
        StringBuilder reference = new StringBuilder();
        reference.append(PREFIX).append("-");
        reference.append(LocalDateTime.now().format(DATE_FORMAT)).append("-");
        reference.append(jobPostingId).append("-");
        reference.append(generateRandomChars(RANDOM_CHARS));

        return reference.toString();
    }

    /**
     * Génère une chaîne aléatoire de caractères alphanumériques.
     *
     * @param length La longueur de la chaîne
     * @return La chaîne générée
     */
    private String generateRandomChars(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(CHARS.length());
            sb.append(CHARS.charAt(index));
        }
        return sb.toString();
    }
}