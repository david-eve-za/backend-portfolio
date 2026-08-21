package gon.cue.llmservice.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.util.List;

@Data
public class RerankRequest {
    @NotBlank
    private String query;
    @NotNull
    private List<String> documents;
    @Min(1)
    private int topN = 5;
    private String model;
}