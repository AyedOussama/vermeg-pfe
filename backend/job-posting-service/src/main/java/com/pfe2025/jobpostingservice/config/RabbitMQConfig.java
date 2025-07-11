package com.pfe2025.jobpostingservice.config;



import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration RabbitMQ pour l'échange de messages asynchrones.
 */
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.name:vermeg.recruitment.exchange}")
    private String exchangeName;

    @Value("${rabbitmq.queue.requisition-approved:vermeg.recruitment.requisition-approved}")
    private String requisitionApprovedQueue;

    @Value("${rabbitmq.queue.requisition-cancelled:vermeg.recruitment.requisition-cancelled}")
    private String requisitionCancelledQueue;

    @Value("${rabbitmq.queue.application-submitted:vermeg.recruitment.application-submitted}")
    private String applicationSubmittedQueue;

    @Value("${rabbitmq.routing.requisition-approved-key:requisition.approved}")
    private String requisitionApprovedRoutingKey;

    @Value("${rabbitmq.routing.requisition-cancelled-key:requisition.cancelled}")
    private String requisitionCancelledRoutingKey;

    @Value("${rabbitmq.routing.application-submitted-key:application.submitted}")
    private String applicationSubmittedRoutingKey;

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName);
    }

    @Bean
    public Queue requisitionApprovedQueue() {
        return new Queue(requisitionApprovedQueue, true);
    }

    @Bean
    public Queue requisitionCancelledQueue() {
        return new Queue(requisitionCancelledQueue, true);
    }

    @Bean
    public Queue applicationSubmittedQueue() {
        return new Queue(applicationSubmittedQueue, true);
    }

    @Bean
    public Binding requisitionApprovedBinding(Queue requisitionApprovedQueue, TopicExchange exchange) {
        return BindingBuilder.bind(requisitionApprovedQueue).to(exchange).with(requisitionApprovedRoutingKey);
    }

    @Bean
    public Binding requisitionCancelledBinding(Queue requisitionCancelledQueue, TopicExchange exchange) {
        return BindingBuilder.bind(requisitionCancelledQueue).to(exchange).with(requisitionCancelledRoutingKey);
    }

    @Bean
    public Binding applicationSubmittedBinding(Queue applicationSubmittedQueue, TopicExchange exchange) {
        return BindingBuilder.bind(applicationSubmittedQueue).to(exchange).with(applicationSubmittedRoutingKey);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
