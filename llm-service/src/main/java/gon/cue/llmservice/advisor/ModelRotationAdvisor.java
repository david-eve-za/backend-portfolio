package gon.cue.llmservice.advisor;

import gon.cue.llmservice.config.ProviderConfig;
import gon.cue.llmservice.model.enums.LLMProvider;
import org.springframework.ai.chat.client.advisor.api.CallAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ModelRotationAdvisor implements CallAdvisor {

    private final List<String> geminiModels;
    private final AtomicInteger currentModelIndex = new AtomicInteger(0);

    public ModelRotationAdvisor(ProviderConfig config) {
        this.geminiModels = config.gemini() != null && config.gemini().modelNames() != null
            ? config.gemini().modelNames()
            : List.of();
    }

    @Override
    public ChatClientResponse adviseCall(ChatClientRequest request, CallAdvisorChain chain) {
        Prompt prompt = request.prompt();
        LLMProvider provider = extractProvider(request);
        
        if (!LLMProvider.GEMINI.equals(provider) || geminiModels.isEmpty()) {
            return chain.nextCall(request);
        }

        int maxRetries = geminiModels.size();
        int attempt = 0;
        Exception lastException = null;

        while (attempt < maxRetries) {
            try {
                int modelIndex = currentModelIndex.get();
                String currentModel = geminiModels.get(modelIndex);
                
                // Set model in prompt options (Spring AI specific)
                Prompt updatedPrompt = withModelOption(prompt, currentModel);
                ChatClientRequest updatedRequest = ChatClientRequest.builder()
                    .prompt(updatedPrompt)
                    .context(request.context())
                    .build();
                
                ChatClientResponse response = chain.nextCall(updatedRequest);
                
                // Check for quota exhaustion in response
                if (isQuotaExhausted(response.chatResponse())) {
                    rotateToNextModel();
                    attempt++;
                    continue;
                }
                
                return response;
                
            } catch (Exception e) {
                lastException = e;
                if (isQuotaExhausted(e)) {
                    rotateToNextModel();
                    attempt++;
                    continue;
                }
                throw e;
            }
        }

        throw new IllegalStateException("All Gemini models exhausted", lastException);
    }

    private boolean isQuotaExhausted(ChatResponse response) {
        // Check response metadata for quota error
        return false; // Placeholder
    }

    private boolean isQuotaExhausted(Exception e) {
        String message = e.getMessage();
        return message != null && (
            message.contains("quota") || 
            message.contains("429") || 
            message.contains("ResourceExhausted") ||
            message.contains("rate limit")
        );
    }

    private void rotateToNextModel() {
        currentModelIndex.updateAndGet(i -> (i + 1) % geminiModels.size());
    }

    private LLMProvider extractProvider(ChatClientRequest request) {
        Prompt prompt = request.prompt();
        Object providerObj = prompt.getInstructions().stream()
            .flatMap(i -> i.getMetadata().entrySet().stream())
            .filter(e -> "provider".equals(e.getKey()))
            .map(Map.Entry::getValue)
            .findFirst()
            .orElse(null);
        
        if (providerObj instanceof LLMProvider) {
            return (LLMProvider) providerObj;
        }
        return LLMProvider.NVIDIA;
    }

    private Prompt withModelOption(Prompt prompt, String model) {
        // Add model option to prompt
        return prompt; // Placeholder - Spring AI specific
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