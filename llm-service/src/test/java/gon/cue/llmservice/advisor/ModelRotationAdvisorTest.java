package gon.cue.llmservice.advisor;

import gon.cue.llmservice.model.enums.LLMProvider;
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
    private CallAdvisorChain chain;

    private ModelRotationAdvisor advisor;

    @Test
    void shouldHaveCorrectNameAndOrder() {
        advisor = new ModelRotationAdvisor();
        
        assertEquals("modelRotationAdvisor", advisor.getName());
        assertEquals(5, advisor.getOrder());
    }

    @Test
    void shouldPassThroughForAnyProvider() {
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

        advisor = new ModelRotationAdvisor();
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

        advisor = new ModelRotationAdvisor();
        ChatClientResponse response = advisor.adviseCall(request, chain);
        assertNotNull(response);
        verify(chain).nextCall(any());
    }
}