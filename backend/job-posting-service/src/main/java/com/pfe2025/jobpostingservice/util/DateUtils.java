package com.pfe2025.jobpostingservice.util;



import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

/**
 * Utilitaires pour la manipulation des dates.
 */
public class DateUtils {

    private DateUtils() {
        // Classe utilitaire, constructeur privé
    }

    /**
     * Calcule une date d'expiration par défaut (30 jours après aujourd'hui).
     *
     * @return La date d'expiration calculée
     */
    public static LocalDateTime calculateDefaultExpirationDate() {
        return LocalDateTime.now().plusDays(30).withHour(23).withMinute(59).withSecond(59);
    }

    /**
     * Vérifie si une date est passée.
     *
     * @param date La date à vérifier
     * @return true si la date est dans le passé
     */
    public static boolean isPast(LocalDateTime date) {
        return date != null && date.isBefore(LocalDateTime.now());
    }

    /**
     * Génère une liste de dates des N derniers jours.
     *
     * @param days Nombre de jours à générer
     * @return Liste des dates
     */
    public static List<LocalDate> getLastNDays(int days) {
        List<LocalDate> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = days - 1; i >= 0; i--) {
            result.add(today.minusDays(i));
        }

        return result;
    }

    /**
     * Calcule le premier jour de la semaine en cours.
     *
     * @return Le premier jour de la semaine (lundi)
     */
    public static LocalDate getFirstDayOfCurrentWeek() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    /**
     * Calcule le premier jour du mois en cours.
     *
     * @return Le premier jour du mois
     */
    public static LocalDate getFirstDayOfCurrentMonth() {
        return LocalDate.now().withDayOfMonth(1);
    }

    /**
     * Calcule le nombre de jours entre deux dates.
     *
     * @param startDate Date de début
     * @param endDate Date de fin
     * @return Nombre de jours entre les deux dates
     */
    public static long daysBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return ChronoUnit.DAYS.between(startDate.toLocalDate(), endDate.toLocalDate());
    }
}
