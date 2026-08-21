package gon.cue.llmservice.model.dto;

import gon.cue.llmservice.model.enums.LLMProvider;
import lombok.Data;

@Data
public class GenerateResponse {
    private String content;
    private String modelName;
    private LLMProvider provider;
    private TokenUsage tokenUsage;
    
    @Data
    public static class TokenUsage {
        private int promptTokens;
        private int completionTokens;
        private int totalTokens;
    }
}