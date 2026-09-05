package gon.cue.llmservice.integration;

import gon.cue.llmservice.model.dto.GenerateResponse;
import gon.cue.llmservice.model.dto.TranslateResponse;
import gon.cue.llmservice.model.enums.LLMProvider;

public interface LLMIntegrationMixin {

    void setLlmClient(LLMServiceClient client);

    default LLMServiceClient getLlmClient() {
        throw new IllegalStateException("LLM client not configured. Call setLlmClient() first.");
    }

    default String llmCall(String prompt, LLMProvider provider, Double temperature, Integer maxTokens) {
        GenerateResponse response = getLlmClient().generate(prompt, provider, temperature, maxTokens);
        return response.getContent();
    }

    default String llmTranslate(String text, String sourceLang, String targetLang, LLMProvider provider) {
        TranslateResponse response = getLlmClient().translate(text, sourceLang, targetLang, provider);
        return response.getTranslation();
    }

    default String llmSummarize(String text, int maxLength, LLMProvider provider) {
        String prompt = String.format("Summarize the following text in at most %d words:\n\n%s\n\nSummary:", maxLength, text);
        return llmCall(prompt, provider, 0.3, maxLength);
    }
}