package gon.cue.llmservice.integration;

import gon.cue.llmservice.model.enums.LLMProvider;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LLMServiceConfig {
    private IntegrationMode mode = IntegrationMode.LOCAL;
    private LLMProvider defaultProvider = LLMProvider.NVIDIA;
    private String httpBaseUrl;
    private int httpTimeout = 30000;
    private int retryAttempts = 3;
}