package gon.cue.llmservice.service;

import gon.cue.llmservice.config.LlmServiceProperties;
import gon.cue.llmservice.model.enums.LLMProvider;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProviderFactoryTest {

    @Test
    void shouldReturnNvidiaChatModelByDefault() {
        ChatModel nvidiaChatModel = mock(ChatModel.class);
        ChatModel ollamaChatModel = mock(ChatModel.class);
        EmbeddingModel nvidiaEmbeddingModel = mock(EmbeddingModel.class);
        EmbeddingModel nvidiaQueryEmbeddingModel = mock(EmbeddingModel.class);

        LlmServiceProperties properties = new LlmServiceProperties(
            LlmServiceProperties.LLMProvider.NVIDIA,
            "./tokenizers",
            "classpath:prompts/translation-prompt.txt"
        );

        ProviderFactory factory = new ProviderFactory(properties, nvidiaChatModel, ollamaChatModel, nvidiaEmbeddingModel, nvidiaQueryEmbeddingModel);

        ChatModel model = factory.getChatModel(null);
        assertNotNull(model);
        assertSame(nvidiaChatModel, model);
    }

    @Test
    void shouldReturnSpecificChatModel() {
        ChatModel nvidiaChatModel = mock(ChatModel.class);
        ChatModel ollamaChatModel = mock(ChatModel.class);
        EmbeddingModel nvidiaEmbeddingModel = mock(EmbeddingModel.class);
        EmbeddingModel nvidiaQueryEmbeddingModel = mock(EmbeddingModel.class);

        LlmServiceProperties properties = new LlmServiceProperties(
            LlmServiceProperties.LLMProvider.NVIDIA,
            "./tokenizers",
            "classpath:prompts/translation-prompt.txt"
        );

        ProviderFactory factory = new ProviderFactory(properties, nvidiaChatModel, ollamaChatModel, nvidiaEmbeddingModel, nvidiaQueryEmbeddingModel);

        assertSame(nvidiaChatModel, factory.getChatModel(LLMProvider.NVIDIA));
        assertSame(ollamaChatModel, factory.getChatModel(LLMProvider.OLLAMA));
    }

    @Test
    void shouldReturnEmbeddingModel() {
        ChatModel nvidiaChatModel = mock(ChatModel.class);
        ChatModel ollamaChatModel = mock(ChatModel.class);
        EmbeddingModel nvidiaEmbeddingModel = mock(EmbeddingModel.class);
        EmbeddingModel nvidiaQueryEmbeddingModel = mock(EmbeddingModel.class);

        LlmServiceProperties properties = new LlmServiceProperties(
            LlmServiceProperties.LLMProvider.NVIDIA,
            "./tokenizers",
            "classpath:prompts/translation-prompt.txt"
        );

        ProviderFactory factory = new ProviderFactory(properties, nvidiaChatModel, ollamaChatModel, nvidiaEmbeddingModel, nvidiaQueryEmbeddingModel);

        EmbeddingModel model = factory.getEmbeddingModel(LLMProvider.NVIDIA);
        assertNotNull(model);
        assertSame(nvidiaEmbeddingModel, model);
    }

    @Test
    void shouldReturnQueryEmbeddingModel() {
        ChatModel nvidiaChatModel = mock(ChatModel.class);
        ChatModel ollamaChatModel = mock(ChatModel.class);
        EmbeddingModel nvidiaEmbeddingModel = mock(EmbeddingModel.class);
        EmbeddingModel nvidiaQueryEmbeddingModel = mock(EmbeddingModel.class);

        LlmServiceProperties properties = new LlmServiceProperties(
            LlmServiceProperties.LLMProvider.NVIDIA,
            "./tokenizers",
            "classpath:prompts/translation-prompt.txt"
        );

        ProviderFactory factory = new ProviderFactory(properties, nvidiaChatModel, ollamaChatModel, nvidiaEmbeddingModel, nvidiaQueryEmbeddingModel);

        EmbeddingModel model = factory.getQueryEmbeddingModel(LLMProvider.NVIDIA);
        assertNotNull(model);
        assertSame(nvidiaQueryEmbeddingModel, model);
    }

    @Test
    void shouldThrowForUnsupportedEmbeddingProvider() {
        ChatModel nvidiaChatModel = mock(ChatModel.class);
        ChatModel ollamaChatModel = mock(ChatModel.class);
        EmbeddingModel nvidiaEmbeddingModel = mock(EmbeddingModel.class);
        EmbeddingModel nvidiaQueryEmbeddingModel = mock(EmbeddingModel.class);

        LlmServiceProperties properties = new LlmServiceProperties(
            LlmServiceProperties.LLMProvider.NVIDIA,
            "./tokenizers",
            "classpath:prompts/translation-prompt.txt"
        );

        ProviderFactory factory = new ProviderFactory(properties, nvidiaChatModel, ollamaChatModel, nvidiaEmbeddingModel, nvidiaQueryEmbeddingModel);

        assertThrows(IllegalArgumentException.class, 
            () -> factory.getEmbeddingModel(LLMProvider.OLLAMA));
    }
}