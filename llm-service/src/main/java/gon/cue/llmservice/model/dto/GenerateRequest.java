package gon.cue.llmservice.model.dto;

import gon.cue.llmservice.model.enums.LLMProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class GenerateRequest {
    @NotBlank
    private String prompt;
    private LLMProvider provider;
    @DecimalMin("0.0") @DecimalMax("2.0")
    private Double temperature;
    @Min(1)
    private Integer maxTokens;
}