package gon.cue.llmservice.advisor;

import gon.cue.llmservice.service.TokenChunkCalculator;
import gon.cue.llmservice.service.tokenizer.DJLTokenizer;
import gon.cue.llmservice.service.tokenizer.TokenizerRegistry;
import gon.cue.llmservice.service.tokenizer.TokenizerType;
import gon.cue.llmservice.model.enums.LLMProvider;
import org.springframework.ai.chat.client.advisor.api.CallAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AdaptiveChunkingAdvisor implements CallAdvisor {

    private final TokenChunkCalculator chunkCalculator;
    private final TokenizerRegistry tokenizerRegistry;

    public AdaptiveChunkingAdvisor(TokenChunkCalculator chunkCalculator,
                                    TokenizerRegistry tokenizerRegistry) {
        this.chunkCalculator = chunkCalculator;
        this.tokenizerRegistry = tokenizerRegistry;
    }

    @Override
    public ChatClientResponse adviseCall(ChatClientRequest request, CallAdvisorChain chain) {
        Prompt prompt = request.prompt();
        
        // Check if this is a translation request with large text
        String text = extractTextForTranslation(prompt);
        if (text == null || text.length() < 1000) {
            return chain.nextCall(request); // Not a large translation, skip
        }

        LLMProvider provider = extractProvider(prompt);
        if (!LLMProvider.NVIDIA.equals(provider)) {
            return chain.nextCall(request); // Only NVIDIA for now
        }

        DJLTokenizer tokenizer = tokenizerRegistry.getTokenizer(
            "meta-llama/Mistral-Large-3-675B-Instruct-2512",
            TokenizerType.HUGGINGFACE
        );

        String sourceLang = extractSourceLang(prompt).orElse("en");
        String targetLang = extractTargetLang(prompt).orElse("es");

        int chunkSize = chunkCalculator.calculateChunkSize(sourceLang, targetLang, tokenizer);
        List<String> chunks = chunkCalculator.splitText(text, chunkSize, tokenizer);

        // Process each chunk and combine
        StringBuilder combinedResponse = new StringBuilder();
        ChatClientResponse lastResponse = null;
        for (String chunk : chunks) {
            Prompt chunkPrompt = replaceTextInPrompt(prompt, chunk);
            ChatClientRequest chunkRequest = ChatClientRequest.builder()
                .prompt(chunkPrompt)
                .context(request.context())
                .build();
            ChatClientResponse chunkResponse = chain.nextCall(chunkRequest);
            combinedResponse.append(chunkResponse.chatResponse().getResult().getOutput().getText());
            lastResponse = chunkResponse;
        }

        // Return combined response
        return createCombinedResponse(lastResponse, combinedResponse.toString());
    }

    private String extractTextForTranslation(Prompt prompt) {
        // Extract text from translation prompt template
        String promptText = prompt.getInstructions().getFirst().getText();
        if (promptText.contains("Translate the following text")) {
            int start = promptText.indexOf("\n\n") + 2;
            int end = promptText.lastIndexOf("\n\n");
            if (start > 0 && end > start) {
                return promptText.substring(start, end).trim();
            }
        }
        return null;
    }

    private LLMProvider extractProvider(Prompt prompt) {
        // Extract from metadata
        return prompt.getInstructions().stream()
            .flatMap(i -> i.getMetadata().entrySet().stream())
            .filter(e -> "provider".equals(e.getKey()))
            .map(e -> (LLMProvider) e.getValue())
            .findFirst()
            .orElse(LLMProvider.NVIDIA);
    }

    private java.util.Optional<String> extractSourceLang(Prompt prompt) {
        return prompt.getInstructions().stream()
            .flatMap(i -> i.getMetadata().entrySet().stream())
            .filter(e -> "sourceLang".equals(e.getKey()))
            .map(e -> (String) e.getValue())
            .findFirst();
    }

    private java.util.Optional<String> extractTargetLang(Prompt prompt) {
        return prompt.getInstructions().stream()
            .flatMap(i -> i.getMetadata().entrySet().stream())
            .filter(e -> "targetLang".equals(e.getKey()))
            .map(e -> (String) e.getValue())
            .findFirst();
    }

    private Prompt replaceTextInPrompt(Prompt original, String newText) {
        // Simplified - replace text in prompt
        return original; // Placeholder
    }

    private ChatClientResponse createCombinedResponse(ChatClientResponse original, String combinedText) {
        if (original == null) {
            return original;
        }
        ChatResponse originalChatResponse = original.chatResponse();
        Generation originalGeneration = originalChatResponse.getResult();
        
        // Create a new AssistantMessage with combined text using builder
        AssistantMessage combinedMessage = AssistantMessage.builder()
            .content(combinedText)
            .build();
        
        // Create a new Generation with combined message
        Generation combinedGeneration = new Generation(
            combinedMessage,
            originalGeneration.getMetadata()
        );
        
        // Create a new ChatResponse with combined generation
        ChatResponse combinedChatResponse = new ChatResponse(
            List.of(combinedGeneration),
            originalChatResponse.getMetadata()
        );
        
        return new ChatClientResponse(combinedChatResponse, original.context());
    }

    @Override
    public String getName() {
        return "adaptiveChunkingAdvisor";
    }

    @Override
    public int getOrder() {
        return 20; // After rate limiting
    }
}