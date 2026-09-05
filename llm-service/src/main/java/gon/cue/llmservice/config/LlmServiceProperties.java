package gon.cue.llmservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.nio.file.Path;

@ConfigurationProperties(prefix = "llm.service")
@Validated
public record LlmServiceProperties(
    @NotNull LLMProvider defaultProvider,
    @NotBlank String tokenizerCacheDir,
    @NotBlank String translationPromptPath
) {
    public enum LLMProvider {
        NVIDIA, OLLAMA
    }
}