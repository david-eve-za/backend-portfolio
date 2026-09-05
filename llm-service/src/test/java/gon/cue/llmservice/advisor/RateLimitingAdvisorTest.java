package gon.cue.llmservice.advisor;

import gon.cue.llmservice.config.ProviderConfig;
import gon.cue.llmservice.model.enums.LLMProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
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
@MockitoSettings(strictness = Strictness.LENIENT)
class RateLimitingAdvisorTest {

    @Mock
    private ProviderConfig config;

    @Mock
    private ProviderConfig.NvidiaConfig nvidiaConfig;

    @Mock
    private CallAdvisorChain chain;

    private RateLimitingAdvisor advisor;

    @BeforeEach
    void setUp() {
        when(config.nvidia()).thenReturn(nvidiaConfig);
        when(nvidiaConfig.rateLimit()).thenReturn(30);
        
        advisor = new RateLimitingAdvisor(config);
    }

    @Test
    void shouldAllowRequestWithinRateLimit() {
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
    void shouldHaveCorrectNameAndOrder() {
        assertEquals("rateLimitingAdvisor", advisor.getName());
        assertEquals(10, advisor.getOrder());
    }
}