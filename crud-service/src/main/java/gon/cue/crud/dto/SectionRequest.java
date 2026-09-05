package gon.cue.crud.dto;

import gon.cue.crud.model.Section.SectionType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Section create/update request")
public class SectionRequest {

    @NotNull
    @Schema(description = "Section number within the volume", example = "1",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer sectionNumber;

    @NotNull
    @Schema(description = "Type of section", example = "CHAPTER",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private SectionType sectionType;

    @Size(max = 500)
    @Schema(description = "Section/chapter title")
    private String title;

    @Schema(description = "Full text content")
    private String content;

    @Schema(description = "Word count")
    private Integer wordCount;

    @Schema(description = "Starting page number")
    private Integer pageStart;

    @Schema(description = "Ending page number")
    private Integer pageEnd;

    @Schema(description = "Whether this section is active", example = "true")
    private Boolean active = true;
}