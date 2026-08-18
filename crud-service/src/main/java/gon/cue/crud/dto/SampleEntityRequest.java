package gon.cue.crud.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Sample entity request for create/update")
public class SampleEntityRequest {

    @NotBlank
    @Size(max = 100)
    @Schema(description = "Name of the entity", example = "Sample Item", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Size(max = 500)
    @Schema(description = "Description of the entity", example = "This is a sample item")
    private String description;

    @Schema(description = "Whether the entity is active", example = "true")
    private Boolean active = true;
}