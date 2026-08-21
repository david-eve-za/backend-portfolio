package gon.cue.llmservice.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmbedRequest {
    @NotNull
    private Object input; // String or List<String>
    private String model;
}