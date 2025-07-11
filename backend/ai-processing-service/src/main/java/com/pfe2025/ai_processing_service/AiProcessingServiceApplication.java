package com.pfe2025.ai_processing_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient // S'enregistre auprès d'Eureka
public class AiProcessingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AiProcessingServiceApplication.class, args);
	}
}
