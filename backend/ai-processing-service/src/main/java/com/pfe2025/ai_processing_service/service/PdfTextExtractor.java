package com.pfe2025.ai_processing_service.service;

import com.pfe2025.ai_processing_service.exception.PdfParsingException;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.PDF; // Import pour PDF.PAGE_COUNT
import org.apache.tika.metadata.TikaCoreProperties; // Import pour TikaCoreProperties.TITLE
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
@Slf4j
public class PdfTextExtractor {

    private final Parser parser = new AutoDetectParser(); // Utiliser AutoDetectParser de Tika

    /**
     * CORRECTION: Extrait le texte d'un PDF fourni sous forme de byte array.
     * Utilise Apache Tika pour une meilleure gestion des différents formats PDF et métadonnées.
     *
     * @param pdfBytes Le contenu du PDF en tableau d'octets.
     * @return Un Mono<String> contenant le texte extrait, ou une erreur PdfParsingException.
     */
    public Mono<String> extractText(byte[] pdfBytes) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            log.warn("Cannot extract text from empty PDF byte array.");
            return Mono.error(new PdfParsingException("PDF byte array is empty."));
        }

        return Mono.fromCallable(() -> {
            log.debug("Starting PDF text extraction using Tika...");
            BodyContentHandler handler = new BodyContentHandler(-1); // -1 pour pas de limite de caractères
            Metadata metadata = new Metadata();
            ParseContext context = new ParseContext();

            try (InputStream stream = new ByteArrayInputStream(pdfBytes)) {
                // Parser le flux d'entrée
                parser.parse(stream, handler, metadata, context);
                String text = handler.toString();

                // CORRECTION: Utiliser les bonnes constantes Tika pour Title et Page Count
                String title = metadata.get(TikaCoreProperties.TITLE);
                String pages = metadata.get("xmpTPg:NPages"); // Utiliser PDF.PAGE_COUNT

                log.info("Tika PDF text extracted successfully ({} characters). Title: '{}', Pages: '{}'",
                        text.length(), title != null ? title : "N/A", pages != null ? pages : "N/A");
                return text;
            } catch (IOException | SAXException | TikaException e) {
                log.error("Failed to parse PDF using Tika: {}", e.getMessage(), e);
                throw new PdfParsingException("Error extracting text from PDF using Tika", e);
            } catch (Exception e) {
                log.error("Unexpected error during Tika PDF parsing: {}", e.getMessage(), e);
                throw new PdfParsingException("Unexpected error during Tika PDF parsing", e);
            }
        }).subscribeOn(Schedulers.boundedElastic()); // Exécuter sur un pool de threads car Tika peut être bloquant
    }
}