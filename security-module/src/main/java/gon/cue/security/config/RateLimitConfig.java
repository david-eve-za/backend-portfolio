package gon.cue.security.config;

import io.github.bucket4j.Bucket;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class RateLimitConfig {

    private final SecurityProperties securityProperties;

    @Bean
    public Bucket bucket() {
        SecurityProperties.RateLimitProperties props = securityProperties.getRateLimit();
        return Bucket.builder()
                .addLimit(limit -> limit
                        .capacity(props.getCapacity())
                        .refillGreedy(props.getRefillTokens(), props.getRefillDuration()))
                .build();
    }
}
