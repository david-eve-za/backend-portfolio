package gon.cue.llmservice.service;

import gon.cue.llmservice.config.LlmServiceProperties;
import gon.cue.llmservice.model.enums.LLMProvider;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "llm.service.default-provider=NVIDIA",
    "spring.ai.openai.api-key=test-key",
    "spring.ai.google.genai.api-key=test-key"
})
class ProviderFactoryTest {

    @Autowired
    private ProviderFactory factory;

    @Test
    void shouldReturnNvidiaChatModelByDefault() {
        ChatModel model = factory.getChatModel(null);
        assertNotNull(model);
    }

    @Test
    void shouldReturnSpecificChatModel() {
        ChatModel nvidia = factory.getChatModel(LLMProvider.NVIDIA);
        ChatModel gemini = factory.getChatModel(LLMProvider.GEMINI);
        ChatModel ollama = factory.getChatModel(LLMProvider.OLLAMA);
        
        assertNotNull(nvidia);
        assertNotNull(gemini);
        assertNotNull(ollama);
    }

    @Test
    void shouldReturnEmbeddingModel() {
        EmbeddingModel model = factory.getEmbeddingModel(LLMProvider.NVIDIA);
        assertNotNull(model);
    }

    @Test
    void shouldThrowForUnsupportedEmbeddingProvider() {
        assertThrows(IllegalArgumentException.class, 
            () -> factory.getEmbeddingModel(LLMProvider.GEMINI));
    }
}