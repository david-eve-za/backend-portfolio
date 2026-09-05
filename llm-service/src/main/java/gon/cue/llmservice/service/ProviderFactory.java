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
    private final Map<LLMProvider, EmbeddingModel> queryEmbeddingModels = new ConcurrentHashMap<>();

    public ProviderFactory(LlmServiceProperties properties,
                           @Qualifier("nvidiaChatModel") ChatModel nvidiaChatModel,
                           @Qualifier("ollamaChatModel") ChatModel ollamaChatModel,
                           @Qualifier("nvidiaEmbeddingModel") EmbeddingModel nvidiaEmbeddingModel,
                           @Qualifier("nvidiaQueryEmbeddingModel") EmbeddingModel nvidiaQueryEmbeddingModel) {
        this.properties = properties;
        chatModels.put(LLMProvider.NVIDIA, nvidiaChatModel);
        chatModels.put(LLMProvider.OLLAMA, ollamaChatModel);
        embeddingModels.put(LLMProvider.NVIDIA, nvidiaEmbeddingModel);
        queryEmbeddingModels.put(LLMProvider.NVIDIA, nvidiaQueryEmbeddingModel);
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

    public EmbeddingModel getQueryEmbeddingModel(LLMProvider provider) {
        LLMProvider effectiveProvider = provider != null ? provider : LLMProvider.NVIDIA;
        EmbeddingModel model = queryEmbeddingModels.get(effectiveProvider);
        if (model == null) {
            throw new IllegalArgumentException("No query embedding model for provider: " + effectiveProvider);
        }
        return model;
    }

    public LLMProvider getDefaultProvider() {
        return toModelProvider(properties.defaultProvider());
    }

    private LLMProvider toModelProvider(LlmServiceProperties.LLMProvider configProvider) {
        return switch (configProvider) {
            case NVIDIA -> LLMProvider.NVIDIA;
            case OLLAMA -> LLMProvider.OLLAMA;
        };
    }
}