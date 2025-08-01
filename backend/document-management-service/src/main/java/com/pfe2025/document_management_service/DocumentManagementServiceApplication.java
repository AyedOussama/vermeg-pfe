package com.pfe2025.document_management_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableR2dbcRepositories
@EnableR2dbcAuditing
public class DocumentManagementServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(DocumentManagementServiceApplication.class, args);
	}
}