package gon.cue.frontendservice.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.stream.Collectors;

@Component
public class ApiProxyWebFilter implements WebFilter {

    private static final Logger log = LoggerFactory.getLogger(ApiProxyWebFilter.class);

    private final WebClient webClient;

    public ApiProxyWebFilter(@Value("${gateway.url:http://localhost:8080}") String gatewayUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(gatewayUrl)
                .build();
        log.info("ApiProxyWebFilter initialized with gateway URL: {}", gatewayUrl);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        // Only proxy /api/** requests
        if (!path.startsWith("/api/")) {
            return chain.filter(exchange);
        }

        log.debug("Proxying API request: {} {}", exchange.getRequest().getMethod(), path);

        // Build the target path (remove "/api" prefix)
        String targetPath = path.substring(4);

        // Forward the request
        return webClient.method(HttpMethod.valueOf(exchange.getRequest().getMethod().name()))
                .uri(targetPath)
                .headers(headers -> {
                    exchange.getRequest().getHeaders().forEach((key, values) -> {
                        if (!"host".equalsIgnoreCase(key) && !"content-length".equalsIgnoreCase(key)) {
                            headers.put(key, values);
                        }
                    });
                })
                .body(org.springframework.web.reactive.function.BodyInserters.fromDataBuffers(exchange.getRequest().getBody()))
                .retrieve()
                .toBodilessEntity()
                .flatMap(response -> {
                    // Copy response headers
                    response.getHeaders().forEach((key, values) -> {
                        exchange.getResponse().getHeaders().put(key, values);
                    });
                    exchange.getResponse().setStatusCode(response.getStatusCode());
                    return Mono.empty();
                })
                .onErrorResume(e -> {
                    log.error("Error proxying API request: {}", e.getMessage());
                    exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.BAD_GATEWAY);
                    return exchange.getResponse().setComplete();
                })
                .then();
    }
}