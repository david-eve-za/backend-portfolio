package gon.cue.llmservice.config;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class SpringAiConfig {

    @Bean
    @Primary
    @Qualifier("nvidiaChatModel")
    public ChatModel nvidiaChatModel(ProviderConfig config) {
        ProviderConfig.NvidiaConfig nvidia = config.nvidia();
        OpenAiApi api = OpenAiApi.builder()
            .baseUrl("https://integrate.api.nvidia.com")
            .apiKey("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")
            .build();
        return OpenAiChatModel.builder()
            .openAiApi(api)
            .defaultOptions(OpenAiChatOptions.builder()
                .model(nvidia.modelName())
                .temperature(nvidia.temperature())
                .topP(nvidia.topP())
                .maxTokens(nvidia.maxOutputTokens())
                .build())
            .build();
    }

    @Bean
    @Qualifier("ollamaChatModel")
    public ChatModel ollamaChatModel(ProviderConfig config) {
        ProviderConfig.OllamaConfig ollama = config.ollama();
        OllamaApi api = OllamaApi.builder()
            .baseUrl("http://localhost:11434")
            .build();
        return OllamaChatModel.builder()
            .ollamaApi(api)
            .defaultOptions(OllamaChatOptions.builder()
                .model(ollama.modelName())
                .temperature(ollama.temperature())
                .topP(ollama.topP())
                .build())
            .build();
    }

    @Bean
    @Primary
    @Qualifier("nvidiaEmbeddingModel")
    public EmbeddingModel nvidiaEmbeddingModel(ProviderConfig config) {
        ProviderConfig.EmbeddingConfig emb = config.embedding();
        return new NvidiaCustomEmbeddingModel(
            "https://integrate.api.nvidia.com",
            "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",
            emb.modelName(),
            emb.dimensions(),
            "passage"
        );
    }

    @Bean
    @Qualifier("nvidiaQueryEmbeddingModel")
    public EmbeddingModel nvidiaQueryEmbeddingModel(ProviderConfig config) {
        ProviderConfig.EmbeddingConfig emb = config.embedding();
        return new NvidiaCustomEmbeddingModel(
            "https://integrate.api.nvidia.com",
            "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",
            emb.modelName(),
            emb.dimensions(),
            "query"
        );
    }

    @Bean
    @Qualifier("nvidiaRerankModel")
    public EmbeddingModel nvidiaRerankModel(ProviderConfig config) {
        ProviderConfig.EmbeddingConfig emb = config.embedding();
        return new NvidiaCustomEmbeddingModel(
            "https://integrate.api.nvidia.com",
            "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",
            emb.modelName(),
            emb.dimensions(),
            "passage"
        );
    }
}