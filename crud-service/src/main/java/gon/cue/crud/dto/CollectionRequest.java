package gon.cue.crud.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Collection create/update request")
public class CollectionRequest {

    @NotBlank
    @Size(max = 255)
    @Schema(description = "Collection name in format 'Collection Name - Volume|Book Number'",
            example = "That Time I Got Reincarnated as a Slime - Volume 19",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Size(max = 500)
    @Schema(description = "Description of the collection/series")
    private String description;

    @Size(max = 255)
    @Schema(description = "Publisher of the collection")
    private String publisher;

    @Schema(description = "Original publication date")
    private LocalDate publicationDate;

    @Size(max = 50)
    @Schema(description = "Primary language")
    private String language;

    @Schema(description = "Total number of volumes")
    private Integer totalVolumes;

    @Schema(description = "Whether the collection is actively published", example = "true")
    private Boolean active = true;
}