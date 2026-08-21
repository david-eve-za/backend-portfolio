package gon.cue.llmservice.model.dto;

import gon.cue.llmservice.model.enums.LLMProvider;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TranslateRequest {
    @NotBlank
    private String text;
    private String sourceLang = "en";
    private String targetLang = "es";
    private LLMProvider provider;
}