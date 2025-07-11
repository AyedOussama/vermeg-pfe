package com.pfe2025.application_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;

@Configuration
public class MessageConfig {

    public static final String EXCHANGE_NAME = "vermeg.recruitment";

    // Files d'attente pour les applications
    public static final String APPLICATION_CREATED_QUEUE = "application.created.queue";
    public static final String APPLICATION_EVALUATED_QUEUE = "application.evaluated.queue";
    public static final String APPLICATION_STATUS_CHANGED_QUEUE = "application.status-changed.queue";

    // Files d'attente pour les entretiens
    public static final String INTERVIEW_REQUESTED_QUEUE = "interview.requested.queue";
    public static final String INTERVIEW_SCHEDULED_QUEUE = "interview.scheduled.queue";
    public static final String INTERVIEW_COMPLETED_QUEUE = "interview.completed.queue";
    public static final String INTERVIEW_CANCELED_QUEUE = "interview.canceled.queue";

    @Bean
    public TopicExchange recruitmentExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    // Files d'attente pour les applications
    @Bean
    public Queue applicationCreatedQueue() {
        return new Queue(APPLICATION_CREATED_QUEUE, true);
    }

    @Bean
    public Queue applicationEvaluatedQueue() {
        return new Queue(APPLICATION_EVALUATED_QUEUE, true);
    }

    @Bean
    public Queue applicationStatusChangedQueue() {
        return new Queue(APPLICATION_STATUS_CHANGED_QUEUE, true);
    }

    // Files d'attente pour les entretiens
    @Bean
    public Queue interviewRequestedQueue() {
        return new Queue(INTERVIEW_REQUESTED_QUEUE, true);
    }

    @Bean
    public Queue interviewScheduledQueue() {
        return new Queue(INTERVIEW_SCHEDULED_QUEUE, true);
    }

    @Bean
    public Queue interviewCompletedQueue() {
        return new Queue(INTERVIEW_COMPLETED_QUEUE, true);
    }

    @Bean
    public Queue interviewCanceledQueue() {
        return new Queue(INTERVIEW_CANCELED_QUEUE, true);
    }

    // Liaisons pour les applications
    @Bean
    public Binding applicationCreatedBinding() {
        return BindingBuilder
                .bind(applicationCreatedQueue())
                .to(recruitmentExchange())
                .with("application.created");
    }

    @Bean
    public Binding applicationEvaluatedBinding() {
        return BindingBuilder
                .bind(applicationEvaluatedQueue())
                .to(recruitmentExchange())
                .with("application.evaluated");
    }

    @Bean
    public Binding applicationStatusChangedBinding() {
        return BindingBuilder
                .bind(applicationStatusChangedQueue())
                .to(recruitmentExchange())
                .with("application.status-changed");
    }

    // Liaisons pour les entretiens
    @Bean
    public Binding interviewRequestedBinding() {
        return BindingBuilder
                .bind(interviewRequestedQueue())
                .to(recruitmentExchange())
                .with("interview.requested");
    }

    @Bean
    public Binding interviewScheduledBinding() {
        return BindingBuilder
                .bind(interviewScheduledQueue())
                .to(recruitmentExchange())
                .with("interview.scheduled");
    }

    @Bean
    public Binding interviewCompletedBinding() {
        return BindingBuilder
                .bind(interviewCompletedQueue())
                .to(recruitmentExchange())
                .with("interview.completed");
    }

    @Bean
    public Binding interviewCanceledBinding() {
        return BindingBuilder
                .bind(interviewCanceledQueue())
                .to(recruitmentExchange())
                .with("interview.canceled");
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public MappingJackson2MessageConverter mappingJackson2MessageConverter() {
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(new ObjectMapper());
        return converter;
    }
}