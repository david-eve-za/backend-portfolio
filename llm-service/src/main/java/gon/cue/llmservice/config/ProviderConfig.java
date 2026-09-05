package gon.cue.llmservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import java.util.Map;

@ConfigurationProperties(prefix = "llm.provider")
@Validated
public record ProviderConfig(
    NvidiaConfig nvidia,
    OllamaConfig ollama,
    EmbeddingConfig embedding,
    RerankConfig rerank
) {
    public record NvidiaConfig(
        @NotBlank String modelName,
        @DecimalMin("0.0") @DecimalMax("2.0") double temperature,
        @DecimalMin("0.0") @DecimalMax("1.0") double topP,
        @Min(1024) @Max(131072) int maxOutputTokens,
        @Min(1) int rateLimit,
        @Min(1) int retryAttempts,
        @Min(1) int requestTimeout,
        @Min(1) int maxBucketSize,
        @Min(1) int contextSize,
        @DecimalMin("0.05") @DecimalMax("0.30") double chunkSafetyMarginPct,
        @Min(512) @Max(65536) int maxChunkTokens,
        @Min(128) int minChunkTokens,
        @NotBlank String localTokenizerName,
        @NotBlank String localTokenizerDir,
        Map<String, Double> expansionRatios
    ) {}

    public record OllamaConfig(
        @NotBlank String modelName,
        @DecimalMin("0.0") @DecimalMax("2.0") double temperature,
        @DecimalMin("0.0") @DecimalMax("1.0") double topP,
        @Min(1) int contextSize,
        boolean validateModel,
        @NotBlank String localTokenizerName,
        @NotBlank String localTokenizerDir,
        @NotBlank String modelId
    ) {}

    public record EmbeddingConfig(
        @NotBlank String modelName,
        @Min(1) int dimensions
    ) {}

    public record RerankConfig(
        @NotBlank String modelName,
        @Min(1) int topN
    ) {}
}