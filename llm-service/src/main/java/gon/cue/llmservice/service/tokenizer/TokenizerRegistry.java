package gon.cue.llmservice.service.tokenizer;

import gon.cue.llmservice.config.LlmServiceProperties;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenizerRegistry {

    private final ConcurrentHashMap<String, DJLTokenizer> cache = new ConcurrentHashMap<>();
    private final Path cacheDir;

    public TokenizerRegistry(LlmServiceProperties properties) {
        this.cacheDir = Paths.get(properties.tokenizerCacheDir());
    }

    public DJLTokenizer getTokenizer(String modelId, TokenizerType type) {
        String key = modelId + ":" + type.name();
        return cache.computeIfAbsent(key, k -> DJLTokenizer.create(type, modelId, cacheDir));
    }

    public int countTokens(DJLTokenizer tokenizer, String text) {
        return tokenizer.countTokens(text);
    }

    @PostConstruct
    public void init() {
        cacheDir.toFile().mkdirs();
    }
}