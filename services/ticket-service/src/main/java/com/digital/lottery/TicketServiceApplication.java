package com.digital.lottery;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
@RequestMapping("/api/ticket")
public class TicketServiceApplication {
    private final RabbitTemplate rabbit;

    public TicketServiceApplication(RabbitTemplate rabbit) {
        this.rabbit = rabbit;
    }

    @Bean
    Queue queue() {
        return new Queue("tickets", false);
    }

    @PostMapping("/buy")
    public String buy(@RequestBody(required = false) String body) {
        rabbit.convertAndSend("tickets", "new-ticket");
        return "Ticket purchased";
    }

    public static void main(String[] args) {
        SpringApplication.run(TicketServiceApplication.class, args);
    }
}
