package gon.cue.llmservice.service;

import gon.cue.llmservice.config.LlmServiceProperties;
import gon.cue.llmservice.model.enums.LLMProvider;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ProviderFactory {

    private final LlmServiceProperties properties;
    private final Map<LLMProvider, ChatModel> chatModels = new ConcurrentHashMap<>();
    private final Map<LLMProvider, EmbeddingModel> embeddingModels = new ConcurrentHashMap<>();

    public ProviderFactory(LlmServiceProperties properties,
                           @Qualifier("nvidiaChatModel") ChatModel nvidiaChatModel,
                           @Qualifier("geminiChatModel") ChatModel geminiChatModel,
                           @Qualifier("ollamaChatModel") ChatModel ollamaChatModel,
                           @Qualifier("nvidiaEmbeddingModel") EmbeddingModel nvidiaEmbeddingModel) {
        this.properties = properties;
        chatModels.put(LLMProvider.NVIDIA, nvidiaChatModel);
        chatModels.put(LLMProvider.GEMINI, geminiChatModel);
        chatModels.put(LLMProvider.OLLAMA, ollamaChatModel);
        embeddingModels.put(LLMProvider.NVIDIA, nvidiaEmbeddingModel);
    }

    public ChatModel getChatModel(LLMProvider provider) {
        LLMProvider effectiveProvider = provider != null ? provider : toModelProvider(properties.defaultProvider());
        ChatModel model = chatModels.get(effectiveProvider);
        if (model == null) {
            throw new IllegalArgumentException("Unsupported provider: " + effectiveProvider);
        }
        return model;
    }

    public EmbeddingModel getEmbeddingModel(LLMProvider provider) {
        LLMProvider effectiveProvider = provider != null ? provider : LLMProvider.NVIDIA;
        EmbeddingModel model = embeddingModels.get(effectiveProvider);
        if (model == null) {
            throw new IllegalArgumentException("No embedding model for provider: " + effectiveProvider);
        }
        return model;
    }

    public LLMProvider getDefaultProvider() {
        return toModelProvider(properties.defaultProvider());
    }

    private LLMProvider toModelProvider(LlmServiceProperties.LLMProvider configProvider) {
        return switch (configProvider) {
            case NVIDIA -> LLMProvider.NVIDIA;
            case GEMINI -> LLMProvider.GEMINI;
            case OLLAMA -> LLMProvider.OLLAMA;
        };
    }
}