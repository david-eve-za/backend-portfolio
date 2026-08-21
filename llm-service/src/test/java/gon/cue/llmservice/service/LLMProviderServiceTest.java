package gon.cue.llmservice.service;

import gon.cue.llmservice.model.dto.GenerateRequest;
import gon.cue.llmservice.model.dto.GenerateResponse;
import gon.cue.llmservice.model.dto.TranslateRequest;
import gon.cue.llmservice.model.enums.LLMProvider;
import gon.cue.llmservice.service.tokenizer.TokenizerRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LLMProviderServiceTest {

    @Mock
    private ProviderFactory providerFactory;

    @Mock
    private TokenChunkCalculator chunkCalculator;

    @Mock
    private TokenizerRegistry tokenizerRegistry;

    @Mock
    private ChatModel nvidiaChatModel;

    @Mock
    private ChatModel geminiChatModel;

    @Mock
    private ChatModel ollamaChatModel;

    private LLMProviderService service;

    @BeforeEach
    void setUp() {
        service = new LLMProviderService(providerFactory, chunkCalculator, tokenizerRegistry);
    }

    @Test
    void shouldGenerateWithDefaultProvider() {
        GenerateRequest request = new GenerateRequest();
        request.setPrompt("Test prompt");
        
        when(providerFactory.getDefaultProvider()).thenReturn(LLMProvider.NVIDIA);
        when(providerFactory.getChatModel(LLMProvider.NVIDIA)).thenReturn(nvidiaChatModel);
        when(nvidiaChatModel.call(any(Prompt.class))).thenReturn(mockChatResponse("Test response"));

        GenerateResponse response = service.generate(request);
        
        assertNotNull(response);
        assertEquals("Test response", response.getContent());
        assertEquals(LLMProvider.NVIDIA, response.getProvider());
    }

    @Test
    void shouldTranslateWithSpecificProvider() {
        TranslateRequest request = new TranslateRequest();
        request.setText("Hello world");
        request.setSourceLang("en");
        request.setTargetLang("es");
        request.setProvider(LLMProvider.GEMINI);
        
        when(providerFactory.getChatModel(LLMProvider.GEMINI)).thenReturn(geminiChatModel);
        when(geminiChatModel.call(any(Prompt.class))).thenReturn(mockChatResponse("Hola mundo"));

        GenerateResponse response = service.translate(request);
        
        assertNotNull(response);
        assertEquals("Hola mundo", response.getContent());
        assertEquals(LLMProvider.GEMINI, response.getProvider());
    }

    private ChatResponse mockChatResponse(String content) {
        AssistantMessage assistantMessage = new AssistantMessage(content);
        Generation generation = new Generation(assistantMessage);
        return new ChatResponse(List.of(generation));
    }
}