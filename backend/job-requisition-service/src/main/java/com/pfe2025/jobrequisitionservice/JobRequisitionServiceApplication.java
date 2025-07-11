package com.pfe2025.jobrequisitionservice;



import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * Point d'entrée principal de l'application Job Requisition Service.
 * Cette classe démarre l'application Spring Boot avec les fonctionnalités
 * de découverte de services et de sécurité basée sur les méthodes activées.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableMethodSecurity
public class JobRequisitionServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobRequisitionServiceApplication.class, args);
	}
}
