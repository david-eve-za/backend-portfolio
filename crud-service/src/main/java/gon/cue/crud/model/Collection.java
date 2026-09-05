package gon.cue.crud.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Table(name = "collections", indexes = {
    @Index(name = "idx_collection_name", columnList = "name"),
    @Index(name = "idx_collection_deleted", columnList = "deleted")
})
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Book collection (series/story with multiple volumes)")
public class Collection extends BaseEntity {

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", nullable = false, length = 255)
    @Schema(description = "Collection name in format 'Collection Name - Volume|Book Number'", example = "That Time I Got Reincarnated as a Slime - Volume 19")
    private String name;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    @Schema(description = "Description of the collection/series", example = "A Japanese light novel series written by Fuse")
    private String description;

    @Size(max = 255)
    @Column(name = "publisher", length = 255)
    @Schema(description = "Publisher of the collection", example = "Kodansha")
    private String publisher;

    @Column(name = "publication_date")
    @Schema(description = "Original publication date of the collection", example = "2013-05-01")
    private LocalDate publicationDate;

    @Size(max = 50)
    @Column(name = "language", length = 50)
    @Schema(description = "Primary language of the collection", example = "Japanese")
    private String language;

    @Column(name = "total_volumes")
    @Schema(description = "Total number of volumes in the collection", example = "25")
    private Integer totalVolumes;

    @Column(name = "active", nullable = false)
    @Schema(description = "Whether the collection is actively being published", example = "true")
    private Boolean active = true;
}