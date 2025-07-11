package com.pfe2025.document_management_service.service;

import com.pfe2025.document_management_service.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

/**
 * Service de sécurité pour la validation des fichiers
 */
@Service
@Slf4j
public class FileSecurityService {

    // Signatures de fichiers dangereux (magic numbers)
    private static final List<byte[]> DANGEROUS_SIGNATURES = Arrays.asList(
            new byte[]{0x4D, 0x5A}, // Executable Windows (.exe)
            new byte[]{0x7F, 0x45, 0x4C, 0x46}, // Executable Linux (ELF)
            new byte[]{(byte) 0xCA, (byte) 0xFE, (byte) 0xBA, (byte) 0xBE}, // Java class
            new byte[]{0x50, 0x4B, 0x03, 0x04}, // ZIP (peut contenir des exécutables)
            new byte[]{0x52, 0x61, 0x72, 0x21} // RAR
    );

    // Signatures PDF valides
    private static final byte[] PDF_SIGNATURE = {0x25, 0x50, 0x44, 0x46}; // %PDF

    // Signatures JPEG valides
    private static final byte[] JPEG_SIGNATURE = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};

    // Signatures PNG valides
    private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

    /**
     * Valide la sécurité d'un fichier basé sur son contenu
     */
    public Mono<Void> validateFileContent(byte[] fileContent, String contentType, String fileName) {
        return Mono.fromCallable(() -> {
            log.debug("Validating file security: {} ({})", fileName, contentType);

            // Vérifier les signatures dangereuses
            if (containsDangerousSignature(fileContent)) {
                throw new InvalidFileException("Fichier potentiellement dangereux détecté");
            }

            // Vérifier la cohérence entre Content-Type et signature réelle
            if (!isContentTypeConsistent(fileContent, contentType)) {
                throw new InvalidFileException("Le type de fichier ne correspond pas au contenu réel");
            }

            // Vérifier la taille minimale (éviter les fichiers vides ou corrompus)
            if (fileContent.length < 10) {
                throw new InvalidFileException("Fichier trop petit ou corrompu");
            }

            log.debug("File security validation passed for: {}", fileName);
            return null;
        });
    }

    /**
     * Vérifie si le fichier contient une signature dangereuse
     */
    private boolean containsDangerousSignature(byte[] content) {
        if (content.length < 4) return false;

        for (byte[] signature : DANGEROUS_SIGNATURES) {
            if (startsWith(content, signature)) {
                log.warn("Dangerous file signature detected: {}", Arrays.toString(signature));
                return true;
            }
        }
        return false;
    }

    /**
     * Vérifie la cohérence entre le Content-Type déclaré et la signature réelle
     */
    private boolean isContentTypeConsistent(byte[] content, String contentType) {
        switch (contentType.toLowerCase()) {
            case "application/pdf":
                return startsWith(content, PDF_SIGNATURE);
            case "image/jpeg":
                return startsWith(content, JPEG_SIGNATURE);
            case "image/png":
                return startsWith(content, PNG_SIGNATURE);
            case "image/webp":
                // WebP signature: RIFF....WEBP
                return content.length >= 12 &&
                        startsWith(content, new byte[]{0x52, 0x49, 0x46, 0x46}) &&
                        startsWith(Arrays.copyOfRange(content, 8, 12), new byte[]{0x57, 0x45, 0x42, 0x50});
            case "application/msword":
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                // Documents Office - signature plus complexe, on fait une validation basique
                return content.length > 100; // Documents Office sont généralement > 100 bytes
            default:
                log.warn("Unknown content type for validation: {}", contentType);
                return true; // Permettre les types inconnus pour l'instant
        }
    }

    /**
     * Vérifie si un tableau commence par une signature donnée
     */
    private boolean startsWith(byte[] content, byte[] signature) {
        if (content.length < signature.length) return false;

        for (int i = 0; i < signature.length; i++) {
            if (content[i] != signature[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Valide le nom de fichier pour éviter les attaques de path traversal
     */
    public Mono<Void> validateFileName(String fileName) {
        return Mono.fromCallable(() -> {
            if (fileName == null || fileName.trim().isEmpty()) {
                throw new InvalidFileException("Nom de fichier manquant");
            }

            // Vérifier les caractères dangereux
            if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\") ||
                    fileName.contains("<") || fileName.contains(">") || fileName.contains("|") ||
                    fileName.contains("?") || fileName.contains("*") || fileName.contains(":")) {
                throw new InvalidFileException("Nom de fichier contient des caractères non autorisés");
            }

            // Vérifier la longueur
            if (fileName.length() > 255) {
                throw new InvalidFileException("Nom de fichier trop long (max 255 caractères)");
            }

            return null;
        });
    }
}
