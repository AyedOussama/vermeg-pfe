package com.pfe2025.application_service.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

/**
 * Utilitaire pour les opérations sur les dates.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class DateUtils {

    /**
     * Calcule le nombre de jours entre deux dates.
     *
     * @param start La date de début
     * @param end La date de fin
     * @return Le nombre de jours
     */
    public static long daysBetween(LocalDateTime start, LocalDateTime end) {
        return ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate());
    }

    /**
     * Calcule le nombre de jours depuis une date.
     *
     * @param date La date
     * @return Le nombre de jours
     */
    public static long daysSince(LocalDateTime date) {
        return daysBetween(date, LocalDateTime.now());
    }

    /**
     * Génère une liste des N derniers jours, y compris aujourd'hui.
     *
     * @param days Le nombre de jours
     * @return La liste des dates
     */
    public static List<LocalDate> getLastNDays(int days) {
        LocalDate today = LocalDate.now();
        return IntStream.rangeClosed(0, days - 1)
                .mapToObj(i -> today.minusDays(i))
                .sorted()
                .toList();
    }

    /**
     * Génère une liste des jours entre deux dates, inclusivement.
     *
     * @param start La date de début
     * @param end La date de fin
     * @return La liste des dates
     */
    public static List<LocalDate> getDaysBetween(LocalDate start, LocalDate end) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate date = start;

        while (!date.isAfter(end)) {
            dates.add(date);
            date = date.plusDays(1);
        }

        return dates;
    }

    /**
     * Formate une durée en jours/heures/minutes pour affichage.
     *
     * @param minutes Le nombre de minutes
     * @return La chaîne formatée
     */
    public static String formatDuration(long minutes) {
        if (minutes < 60) {
            return minutes + " min";
        }

        if (minutes < 24 * 60) {
            long hours = minutes / 60;
            long mins = minutes % 60;
            return hours + "h" + (mins > 0 ? " " + mins + "m" : "");
        }

        long days = minutes / (24 * 60);
        long hours = (minutes % (24 * 60)) / 60;
        return days + "j" + (hours > 0 ? " " + hours + "h" : "");
    }
}