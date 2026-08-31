package gon.cue.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRouteConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("security-auth", r -> r.path("/api/auth/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://security-service"))
                .route("security-users", r -> r.path("/api/users/**")
                        .uri("lb://security-service"))
                .route("llm-service", r -> r.path("/api/llm/**")
                        .uri("lb://llm-service"))
                .route("crud-service", r -> r.path("/api/v1/**")
                        .uri("lb://crud-service"))
                .route("frontend-service", r -> r.path("/**")
                        .uri("lb://frontend-service"))
                .build();
    }
}