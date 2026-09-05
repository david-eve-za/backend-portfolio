package gon.cue.frontendservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class FrontendServiceApplication {

    public static void main(String[] args) {
        System.out.println("FrontendServiceApplication: main() started");
        SpringApplication.run(FrontendServiceApplication.class, args);
        System.out.println("FrontendServiceApplication: main() completed");
    }

    @Bean
    public String testBean() {
        System.out.println("FrontendServiceApplication: testBean() called");
        return "test";
    }
}