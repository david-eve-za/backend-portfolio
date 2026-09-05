package gon.cue.frontendservice.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;

public class ApiProxyFilter implements Filter {

    @Value("${gateway.url:http://localhost:8080}")
    private String gatewayUrl;

    private final WebClient webClient = WebClient.builder().build();

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, jakarta.servlet.ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        String method = request.getMethod();

        // Handle CORS preflight
        if ("OPTIONS".equals(method)) {
            response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Max-Age", "3600");
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String pathLower = path.toLowerCase();
        boolean isPublicAuthEndpoint = pathLower.contains("authenticate") || pathLower.contains("register");

        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            if (!name.equalsIgnoreCase("host") && !name.equalsIgnoreCase("content-length")) {
                // Don't forward Authorization for public auth endpoints
                if (isPublicAuthEndpoint && name.equalsIgnoreCase("authorization")) {
                    System.out.println("ApiProxyFilter: Stripping Authorization header for " + path);
                    continue;
                }
                headers.put(name, Collections.list(request.getHeaders(name)));
            }
        }

        String queryString = request.getQueryString();
        String targetUrl = gatewayUrl + path + (queryString != null ? "?" + queryString : "");

        byte[] body = new byte[0];
        if (!"GET".equals(method) && !"HEAD".equals(method)) {
            body = StreamUtils.copyToByteArray(request.getInputStream());
        }

        String origin = request.getHeader("Origin");
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
        }

        webClient.method(HttpMethod.valueOf(method))
                .uri(targetUrl)
                .headers(h -> h.putAll(headers))
                .bodyValue(body)
                .exchangeToMono(clientResponse -> {
                    response.setStatus(clientResponse.statusCode().value());
                    clientResponse.headers().asHttpHeaders().forEach((k, v) -> {
                        if (!k.equalsIgnoreCase("transfer-encoding")) {
                            response.setHeader(k, String.join(",", v));
                        }
                    });
                    return clientResponse.bodyToMono(byte[].class)
                            .doOnNext(bytes -> {
                                try {
                                    response.getOutputStream().write(bytes);
                                } catch (IOException e) {
                                    throw new RuntimeException(e);
                                }
                            })
                            .then();
                })
                .block();
    }
}