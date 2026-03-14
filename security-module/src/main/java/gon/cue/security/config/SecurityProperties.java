package gon.cue.security.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "security")
public class SecurityProperties {

    private CorsProperties cors = new CorsProperties();
    private RateLimitProperties rateLimit = new RateLimitProperties();
    private JwtProperties jwt = new JwtProperties();

    @Data
    public static class CorsProperties {
        private List<String> allowedOrigins = List.of("http://localhost:3000");
        private List<String> allowedMethods = List.of("GET", "POST", "PUT", "DELETE", "OPTIONS");
        private List<String> allowedHeaders = List.of("Authorization", "Content-Type", "X-XSRF-TOKEN");
        private boolean allowCredentials = true;
    }

    @Data
    public static class RateLimitProperties {
        private int capacity = 10;
        private int refillTokens = 10;
        private Duration refillDuration = Duration.ofMinutes(1);
    }

    @Data
    public static class JwtProperties {
        private String secret;
        private long expiration = 36000000;
        private String algorithm = "HS256";
    }
}
