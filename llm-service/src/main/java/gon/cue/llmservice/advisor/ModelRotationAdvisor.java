package gon.cue.llmservice.advisor;

import org.springframework.ai.chat.client.advisor.api.CallAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.stereotype.Component;

@Component
public class ModelRotationAdvisor implements CallAdvisor {

    @Override
    public ChatClientResponse adviseCall(ChatClientRequest request, CallAdvisorChain chain) {
        // No-op - Google GenAI provider removed
        return chain.nextCall(request);
    }

    @Override
    public String getName() {
        return "modelRotationAdvisor";
    }

    @Override
    public int getOrder() {
        return 5; // Before rate limiting
    }
}