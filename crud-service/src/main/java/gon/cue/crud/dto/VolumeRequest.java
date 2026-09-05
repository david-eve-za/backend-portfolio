package gon.cue.crud.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Volume create/update request")
public class VolumeRequest {

    @NotNull
    @Schema(description = "Volume number within the collection", example = "19",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer volumeNumber;

    @Size(max = 500)
    @Schema(description = "Volume title/subtitle")
    private String title;

    @Size(max = 255)
    @Schema(description = "ISBN-13 or ISBN-10")
    private String isbn;

    @Size(max = 255)
    @Schema(description = "Publisher of this volume")
    private String publisher;

    @Schema(description = "Publication date")
    private LocalDate publicationDate;

    @Schema(description = "Page count")
    private Integer pageCount;

    @Size(max = 50)
    @Schema(description = "Language")
    private String language;

    @Size(max = 1000)
    @Schema(description = "Cover image URL")
    private String coverImageUrl;

    @Schema(description = "Whether this volume is active", example = "true")
    private Boolean active = true;
}