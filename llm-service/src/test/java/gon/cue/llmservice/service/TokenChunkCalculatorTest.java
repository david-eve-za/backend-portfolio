package gon.cue.llmservice.service;

import gon.cue.llmservice.config.LlmServiceProperties;
import gon.cue.llmservice.config.ProviderConfig;
import gon.cue.llmservice.service.tokenizer.DJLTokenizer;
import gon.cue.llmservice.service.tokenizer.TokenizerRegistry;
import gon.cue.llmservice.service.tokenizer.TokenizerType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import dev.langchain4j.data.document.splitter.DocumentBySentenceSplitter;

import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TokenChunkCalculatorTest {

    @Test
    void shouldCalculateChunkSizeForEnglishToSpanish(@TempDir Path tempDir) {
        LlmServiceProperties properties = new LlmServiceProperties(
            LlmServiceProperties.LLMProvider.NVIDIA,
            tempDir.toString(),
            "classpath:prompts/translation-prompt.txt"
        );
        
        ProviderConfig.NvidiaConfig nvidiaConfig = new ProviderConfig.NvidiaConfig(
            "test-model", 0.7, 0.9, 8192, 10, 3, 30, 100,
            131072, 0.15, 32768, 512,
            "gpt2", tempDir.resolve("nvidia").toString(), null
        );
        ProviderConfig.OllamaConfig ollamaConfig = new ProviderConfig.OllamaConfig(
            "llama3.2", 0.3, 0.95, 8192, true,
            "llama3.2", tempDir.resolve("ollama").toString(), "llama3.2"
        );
        ProviderConfig.EmbeddingConfig embeddingConfig = new ProviderConfig.EmbeddingConfig(
            "nvidia/nv-embedqa-e5-v5", 1024
        );
        ProviderConfig.RerankConfig rerankConfig = new ProviderConfig.RerankConfig(
            "nvidia/nv-rerankqa-mistral-4b", 5
        );
        ProviderConfig config = new ProviderConfig(nvidiaConfig, ollamaConfig, embeddingConfig, rerankConfig);
        
        TokenizerRegistry tokenizerRegistry = new TokenizerRegistry(properties);
        DocumentBySentenceSplitter splitter = new DocumentBySentenceSplitter(2000, 200);
        
        TokenChunkCalculator calculator = new TokenChunkCalculator(tokenizerRegistry, config, splitter, properties);
        
        DJLTokenizer tokenizer = tokenizerRegistry.getTokenizer("gpt2", TokenizerType.HUGGINGFACE);
        int chunkSize = calculator.calculateChunkSize("en", "es", tokenizer);
        
        assertTrue(chunkSize >= 512);
        assertTrue(chunkSize <= 32768);
    }

    @Test
    void shouldSplitTextIntoChunks(@TempDir Path tempDir) {
        LlmServiceProperties properties = new LlmServiceProperties(
            LlmServiceProperties.LLMProvider.NVIDIA,
            tempDir.toString(),
            "classpath:prompts/translation-prompt.txt"
        );
        
        ProviderConfig.NvidiaConfig nvidiaConfig = new ProviderConfig.NvidiaConfig(
            "test-model", 0.7, 0.9, 8192, 10, 3, 30, 100,
            131072, 0.15, 32768, 512,
            "gpt2", tempDir.resolve("nvidia").toString(), null
        );
        ProviderConfig.OllamaConfig ollamaConfig = new ProviderConfig.OllamaConfig(
            "llama3.2", 0.3, 0.95, 8192, true,
            "llama3.2", tempDir.resolve("ollama").toString(), "llama3.2"
        );
        ProviderConfig.EmbeddingConfig embeddingConfig = new ProviderConfig.EmbeddingConfig(
            "nvidia/nv-embedqa-e5-v5", 1024
        );
        ProviderConfig.RerankConfig rerankConfig = new ProviderConfig.RerankConfig(
            "nvidia/nv-rerankqa-mistral-4b", 5
        );
        ProviderConfig config = new ProviderConfig(nvidiaConfig, ollamaConfig, embeddingConfig, rerankConfig);
        
        TokenizerRegistry tokenizerRegistry = new TokenizerRegistry(properties);
        DocumentBySentenceSplitter splitter = new DocumentBySentenceSplitter(2000, 200);
        
        TokenChunkCalculator calculator = new TokenChunkCalculator(tokenizerRegistry, config, splitter, properties);
        
        DJLTokenizer tokenizer = tokenizerRegistry.getTokenizer("gpt2", TokenizerType.HUGGINGFACE);
        
        // Use a smaller chunk size to force splitting
        int testChunkSize = 100;
        
        // Create a long text that will definitely exceed 100 tokens
        String longText = "This is a test sentence that will be tokenized into multiple tokens. ".repeat(50);
        List<String> chunks = calculator.splitText(longText, testChunkSize, tokenizer);
        
        assertFalse(chunks.isEmpty());
        assertTrue(chunks.size() > 1);
    }

    @Test
    void shouldReturnExpansionRatio(@TempDir Path tempDir) {
        LlmServiceProperties properties = new LlmServiceProperties(
            LlmServiceProperties.LLMProvider.NVIDIA,
            tempDir.toString(),
            "classpath:prompts/translation-prompt.txt"
        );
        
        ProviderConfig.NvidiaConfig nvidiaConfig = new ProviderConfig.NvidiaConfig(
            "test-model", 0.7, 0.9, 8192, 10, 3, 30, 100,
            131072, 0.15, 32768, 512,
            "gpt2", tempDir.resolve("nvidia").toString(), null
        );
        ProviderConfig.OllamaConfig ollamaConfig = new ProviderConfig.OllamaConfig(
            "llama3.2", 0.3, 0.95, 8192, true,
            "llama3.2", tempDir.resolve("ollama").toString(), "llama3.2"
        );
        ProviderConfig.EmbeddingConfig embeddingConfig = new ProviderConfig.EmbeddingConfig(
            "nvidia/nv-embedqa-e5-v5", 1024
        );
        ProviderConfig.RerankConfig rerankConfig = new ProviderConfig.RerankConfig(
            "nvidia/nv-rerankqa-mistral-4b", 5
        );
        ProviderConfig config = new ProviderConfig(nvidiaConfig, ollamaConfig, embeddingConfig, rerankConfig);
        
        TokenizerRegistry tokenizerRegistry = new TokenizerRegistry(properties);
        DocumentBySentenceSplitter splitter = new DocumentBySentenceSplitter(2000, 200);
        
        TokenChunkCalculator calculator = new TokenChunkCalculator(tokenizerRegistry, config, splitter, properties);
        
        DJLTokenizer tokenizer = tokenizerRegistry.getTokenizer("gpt2", TokenizerType.HUGGINGFACE);
        
        double ratio = calculator.getExpansionRatio("en", "es");
        assertEquals(1.30, ratio);
        
        ratio = calculator.getExpansionRatio("en", "zh");
        assertEquals(0.55, ratio);
    }
}