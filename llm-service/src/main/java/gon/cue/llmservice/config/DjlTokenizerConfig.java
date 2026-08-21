package gon.cue.llmservice.config;

import gon.cue.llmservice.service.tokenizer.DJLTokenizer;
import gon.cue.llmservice.service.tokenizer.TokenizerRegistry;
import gon.cue.llmservice.service.tokenizer.TokenizerType;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

@Configuration
@EnableConfigurationProperties({LlmServiceProperties.class, ProviderConfig.class})
public class DjlTokenizerConfig {

    @Bean
    public TokenizerRegistry tokenizerRegistry(LlmServiceProperties properties) {
        return new TokenizerRegistry(properties);
    }

    @Bean
    public DJLTokenizer nvidiaTokenizer(TokenizerRegistry registry, ProviderConfig config) {
        return registry.getTokenizer(config.nvidia().localTokenizerName(), TokenizerType.HUGGINGFACE);
    }

    @Bean
    @Lazy
    public DJLTokenizer geminiTokenizer(TokenizerRegistry registry, ProviderConfig config) {
        // Gemini uses SentencePiece
        return registry.getTokenizer("gemini-tokenizer", TokenizerType.SENTENCEPIECE);
    }

    @Bean
    @Lazy
    public DJLTokenizer ollamaTokenizer(TokenizerRegistry registry, ProviderConfig config) {
        return registry.getTokenizer(config.ollama().localTokenizerName(), TokenizerType.HUGGINGFACE);
    }
}