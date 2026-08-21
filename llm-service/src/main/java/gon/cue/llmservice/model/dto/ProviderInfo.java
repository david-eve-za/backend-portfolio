package gon.cue.llmservice.model.dto;

import gon.cue.llmservice.model.enums.LLMProvider;
import lombok.Data;

@Data
public class ProviderInfo {
    private LLMProvider defaultProvider;
    private LLMProvider[] availableProviders;
}