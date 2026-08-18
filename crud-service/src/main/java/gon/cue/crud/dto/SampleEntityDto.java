package gon.cue.crud.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
@Schema(description = "Sample entity DTO")
public class SampleEntityDto {

    @Schema(description = "Unique identifier", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Schema(description = "Name of the entity", example = "Sample Item")
    private String name;

    @Size(max = 500)
    @Schema(description = "Description of the entity", example = "This is a sample item")
    private String description;

    @Schema(description = "Whether the entity is active", example = "true")
    private Boolean active = true;

    @Schema(description = "Creation timestamp", accessMode = Schema.AccessMode.READ_ONLY)
    private Instant createdAt;

    @Schema(description = "Last update timestamp", accessMode = Schema.AccessMode.READ_ONLY)
    private Instant updatedAt;
}