package gon.cue.llmservice.service.tokenizer;

import gon.cue.llmservice.config.LlmServiceProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class TokenizerRegistryTest {

    @Test
    void shouldCreateAndCacheTokenizer(@TempDir Path tempDir) {
        LlmServiceProperties properties = new LlmServiceProperties(
            LlmServiceProperties.LLMProvider.NVIDIA,
            tempDir.toString(),
            "classpath:prompts/translation.txt"
        );
        TokenizerRegistry registry = new TokenizerRegistry(properties);

        DJLTokenizer tokenizer = registry.getTokenizer("gpt2", TokenizerType.HUGGINGFACE);
        assertNotNull(tokenizer);
        assertEquals(TokenizerType.HUGGINGFACE, tokenizer.getType());

        // Second call should return cached instance
        DJLTokenizer cached = registry.getTokenizer("gpt2", TokenizerType.HUGGINGFACE);
        assertSame(tokenizer, cached);
    }

    @Test
    void shouldCountTokens(@TempDir Path tempDir) {
        LlmServiceProperties properties = new LlmServiceProperties(
            LlmServiceProperties.LLMProvider.NVIDIA,
            tempDir.toString(),
            "classpath:prompts/translation.txt"
        );
        TokenizerRegistry registry = new TokenizerRegistry(properties);

        DJLTokenizer tokenizer = registry.getTokenizer("gpt2", TokenizerType.HUGGINGFACE);
        int count = tokenizer.countTokens("Hello world");
        assertTrue(count > 0);
    }
}