package gon.cue.llmservice.advisor;

import gon.cue.llmservice.config.ProviderConfig;
import gon.cue.llmservice.model.enums.LLMProvider;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.ai.chat.client.advisor.api.CallAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingAdvisor implements CallAdvisor {

    private final Map<LLMProvider, Bucket> buckets = new ConcurrentHashMap<>();
    private final ProviderConfig config;

    public RateLimitingAdvisor(ProviderConfig config) {
        this.config = config;
        initializeBuckets();
    }

    private void initializeBuckets() {
        // NVIDIA
        ProviderConfig.NvidiaConfig nvidia = config.nvidia();
        buckets.put(LLMProvider.NVIDIA, Bucket.builder()
            .addLimit(Bandwidth.classic(nvidia.rateLimit(), 
                Refill.greedy(nvidia.rateLimit(), Duration.ofMinutes(1))))
            .build());

        // Gemini
        ProviderConfig.GeminiConfig gemini = config.gemini();
        buckets.put(LLMProvider.GEMINI, Bucket.builder()
            .addLimit(Bandwidth.classic(gemini.rateLimit(), 
                Refill.greedy(gemini.rateLimit(), Duration.ofMinutes(1))))
            .build());

        // Ollama (no rate limit needed for local)
        buckets.put(LLMProvider.OLLAMA, Bucket.builder()
            .addLimit(Bandwidth.classic(1000, 
                Refill.greedy(1000, Duration.ofMinutes(1))))
            .build());
    }

    @Override
    public ChatClientResponse adviseCall(ChatClientRequest request, CallAdvisorChain chain) {
        LLMProvider provider = extractProvider(request);
        Bucket bucket = buckets.getOrDefault(provider, buckets.get(LLMProvider.NVIDIA));
        
        // Try to consume token, block if necessary
        try {
            bucket.asBlocking().consume(1);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Rate limiting interrupted", e);
        }
        
        return chain.nextCall(request);
    }

    private LLMProvider extractProvider(ChatClientRequest request) {
        // Extract from prompt metadata or default
        Prompt prompt = request.prompt();
        Object providerObj = prompt.getInstructions().stream()
            .flatMap(i -> i.getMetadata().entrySet().stream())
            .filter(e -> "provider".equals(e.getKey()))
            .map(Map.Entry::getValue)
            .findFirst()
            .orElse(null);
        
        if (providerObj instanceof LLMProvider) {
            return (LLMProvider) providerObj;
        }
        return LLMProvider.NVIDIA;
    }

    @Override
    public String getName() {
        return "rateLimitingAdvisor";
    }

    @Override
    public int getOrder() {
        return 10; // Run early
    }
}