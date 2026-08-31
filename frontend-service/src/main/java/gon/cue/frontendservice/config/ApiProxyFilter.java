package gon.cue.frontendservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ClientHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.Enumeration;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiProxyFilter extends HttpFilter {

    @Value("${gateway.url:http://localhost:8080}")
    private String gatewayUrl;

    private final WebClient webClient = WebClient.builder().build();

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {

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

        String queryString = request.getQueryString();
        String targetUrl = gatewayUrl + path + (queryString != null ? "?" + queryString : "");

        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            if (!name.equalsIgnoreCase("host") && !name.equalsIgnoreCase("content-length")) {
                headers.put(name, Collections.list(request.getHeaders(name)));
            }
        }

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