package com.pfe2025.jobpostingservice;



import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * Classe principale qui démarre l'application Job Posting Service.
 * Ce microservice gère le cycle de vie complet des offres d'emploi au sein
 * de la plateforme de recrutement de Vermeg.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableMethodSecurity
@EnableCaching
@EnableAsync
@EnableScheduling
public class JobPostingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobPostingServiceApplication.class, args);
	}
}