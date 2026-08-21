package gon.cue.llmservice.advisor;

import gon.cue.llmservice.config.ProviderConfig;
import gon.cue.llmservice.model.enums.LLMProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModelRotationAdvisorTest {

    @Mock
    private ProviderConfig config;

    @Mock
    private ProviderConfig.GeminiConfig geminiConfig;

    @Mock
    private CallAdvisorChain chain;

    private ModelRotationAdvisor advisor;

    @BeforeEach
    void setUp() {
        when(config.gemini()).thenReturn(geminiConfig);
        when(geminiConfig.modelNames()).thenReturn(List.of("gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"));
        
        advisor = new ModelRotationAdvisor(config);
    }

    @Test
    void shouldHaveCorrectNameAndOrder() {
        assertEquals("modelRotationAdvisor", advisor.getName());
        assertEquals(5, advisor.getOrder());
    }

    @Test
    void shouldPassThroughForNonGeminiProvider() {
        ChatResponse chatResponse = new ChatResponse(List.of(new Generation(new AssistantMessage("OK"))));
        ChatClientResponse mockResponse = new ChatClientResponse(chatResponse, Map.of());
        when(chain.nextCall(any(ChatClientRequest.class)))
            .thenReturn(mockResponse);

        UserMessage userMessage = UserMessage.builder()
            .text("test")
            .metadata(Map.of("provider", LLMProvider.NVIDIA))
            .build();
        
        Prompt prompt = new Prompt(List.of(userMessage));
        ChatClientRequest request = ChatClientRequest.builder()
            .prompt(prompt)
            .context(Map.of())
            .build();

        ChatClientResponse response = advisor.adviseCall(request, chain);
        assertNotNull(response);
        verify(chain).nextCall(any());
    }

    @Test
    void shouldDefaultToNvidiaWhenNoProviderInMetadata() {
        ChatResponse chatResponse = new ChatResponse(List.of(new Generation(new AssistantMessage("OK"))));
        ChatClientResponse mockResponse = new ChatClientResponse(chatResponse, Map.of());
        when(chain.nextCall(any(ChatClientRequest.class)))
            .thenReturn(mockResponse);

        ChatClientRequest request = ChatClientRequest.builder()
            .prompt(new Prompt("test"))
            .context(Map.of())
            .build();

        ChatClientResponse response = advisor.adviseCall(request, chain);
        assertNotNull(response);
        verify(chain).nextCall(any());
    }

    @Test
    void shouldRotateModelOnQuotaException() {
        // First call throws quota exception, second succeeds
        ChatResponse chatResponse = new ChatResponse(List.of(new Generation(new AssistantMessage("OK"))));
        ChatClientResponse mockResponse = new ChatClientResponse(chatResponse, Map.of());
        
        when(chain.nextCall(any(ChatClientRequest.class)))
            .thenThrow(new IllegalStateException("quota exceeded"))
            .thenReturn(mockResponse);

        UserMessage userMessage = UserMessage.builder()
            .text("test")
            .metadata(Map.of("provider", LLMProvider.GEMINI))
            .build();
        
        Prompt prompt = new Prompt(List.of(userMessage));
        ChatClientRequest request = ChatClientRequest.builder()
            .prompt(prompt)
            .context(Map.of())
            .build();

        ChatClientResponse response = advisor.adviseCall(request, chain);
        assertNotNull(response);
        verify(chain, times(2)).nextCall(any());
    }

    @Test
    void shouldRotateModelOn429Exception() {
        ChatResponse chatResponse = new ChatResponse(List.of(new Generation(new AssistantMessage("OK"))));
        ChatClientResponse mockResponse = new ChatClientResponse(chatResponse, Map.of());
        
        when(chain.nextCall(any(ChatClientRequest.class)))
            .thenThrow(new IllegalStateException("429 Too Many Requests"))
            .thenReturn(mockResponse);

        UserMessage userMessage = UserMessage.builder()
            .text("test")
            .metadata(Map.of("provider", LLMProvider.GEMINI))
            .build();
        
        Prompt prompt = new Prompt(List.of(userMessage));
        ChatClientRequest request = ChatClientRequest.builder()
            .prompt(prompt)
            .context(Map.of())
            .build();

        ChatClientResponse response = advisor.adviseCall(request, chain);
        assertNotNull(response);
        verify(chain, times(2)).nextCall(any());
    }

    @Test
    void shouldRotateModelOnResourceExhaustedException() {
        ChatResponse chatResponse = new ChatResponse(List.of(new Generation(new AssistantMessage("OK"))));
        ChatClientResponse mockResponse = new ChatClientResponse(chatResponse, Map.of());
        
        when(chain.nextCall(any(ChatClientRequest.class)))
            .thenThrow(new IllegalStateException("ResourceExhausted: quota exceeded"))
            .thenReturn(mockResponse);

        UserMessage userMessage = UserMessage.builder()
            .text("test")
            .metadata(Map.of("provider", LLMProvider.GEMINI))
            .build();
        
        Prompt prompt = new Prompt(List.of(userMessage));
        ChatClientRequest request = ChatClientRequest.builder()
            .prompt(prompt)
            .context(Map.of())
            .build();

        ChatClientResponse response = advisor.adviseCall(request, chain);
        assertNotNull(response);
        verify(chain, times(2)).nextCall(any());
    }

    @Test
    void shouldThrowWhenAllModelsExhausted() {
        ChatResponse chatResponse = new ChatResponse(List.of(new Generation(new AssistantMessage("OK"))));
        ChatClientResponse mockResponse = new ChatClientResponse(chatResponse, Map.of());
        
        when(chain.nextCall(any(ChatClientRequest.class)))
            .thenThrow(new IllegalStateException("quota exceeded"));

        UserMessage userMessage = UserMessage.builder()
            .text("test")
            .metadata(Map.of("provider", LLMProvider.GEMINI))
            .build();
        
        Prompt prompt = new Prompt(List.of(userMessage));
        ChatClientRequest request = ChatClientRequest.builder()
            .prompt(prompt)
            .context(Map.of())
            .build();

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            advisor.adviseCall(request, chain);
        });
        assertEquals("All Gemini models exhausted", exception.getMessage());
        verify(chain, times(3)).nextCall(any()); // 3 models in config
    }

    @Test
    void shouldNotRetryOnNonQuotaException() {
        when(chain.nextCall(any(ChatClientRequest.class)))
            .thenThrow(new IllegalArgumentException("Invalid request"));

        UserMessage userMessage = UserMessage.builder()
            .text("test")
            .metadata(Map.of("provider", LLMProvider.GEMINI))
            .build();
        
        Prompt prompt = new Prompt(List.of(userMessage));
        ChatClientRequest request = ChatClientRequest.builder()
            .prompt(prompt)
            .context(Map.of())
            .build();

        assertThrows(IllegalArgumentException.class, () -> {
            advisor.adviseCall(request, chain);
        });
        verify(chain, times(1)).nextCall(any());
    }
}