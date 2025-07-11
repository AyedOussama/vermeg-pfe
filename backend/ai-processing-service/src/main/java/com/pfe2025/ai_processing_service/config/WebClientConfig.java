package com.pfe2025.ai_processing_service.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
@Slf4j
public class WebClientConfig {

    // Create a filter for logging WebClient requests and responses
    @Bean
    public ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
            if (log.isDebugEnabled()) {
                log.debug("Request: {} {}", clientRequest.method(), clientRequest.url());
                clientRequest.headers().forEach((name, values) -> {
                    if (!name.equalsIgnoreCase("Authorization")) { // Don't log auth headers
                        values.forEach(value -> log.debug("{}={}", name, value));
                    } else {
                        log.debug("{}: [PROTECTED]", name);
                    }
                });
            }
            return Mono.just(clientRequest);
        });
    }



    // WebClient pour appeler l'API Together AI
    @Bean("togetherAiWebClient")
    public WebClient togetherAiWebClient(TogetherAiConfig config, WebClient.Builder builder) {
        HttpClient httpClient = HttpClient.create();
        if (config.getConnectTimeoutMs() != null) {
            httpClient = httpClient.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, config.getConnectTimeoutMs());
        }
        if (config.getReadTimeoutMs() != null) {
            httpClient = httpClient.responseTimeout(Duration.ofMillis(config.getReadTimeoutMs()))
                    .doOnConnected(conn -> conn
                            .addHandlerLast(new ReadTimeoutHandler(config.getReadTimeoutMs(), TimeUnit.MILLISECONDS))
                            .addHandlerLast(new WriteTimeoutHandler(config.getReadTimeoutMs(), TimeUnit.MILLISECONDS)));
        }

        return builder
                .baseUrl(config.getBaseUrl())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + config.getApiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .filter(logRequest())
                .build();
    }

    // WebClient pour appeler le Document Management Service (sans sécurité)
    @Bean("documentServiceWebClient")
    public WebClient documentServiceWebClient(
            @Value("${document-service.base-url}") String documentServiceBaseUrl,
            WebClient.Builder builder) {

        return builder
                .baseUrl(documentServiceBaseUrl)
                .filter(logRequest())
                .build();
    }
}