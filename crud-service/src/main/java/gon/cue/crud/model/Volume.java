package gon.cue.crud.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Table(name = "volumes", indexes = {
    @Index(name = "idx_volume_collection", columnList = "collection_id"),
    @Index(name = "idx_volume_collection_number", columnList = "collection_id, volume_number"),
    @Index(name = "idx_volume_isbn", columnList = "isbn"),
    @Index(name = "idx_volume_deleted", columnList = "deleted")
})
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Individual volume/book within a collection")
public class Volume extends BaseEntity {

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "collection_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_volume_collection", foreignKeyDefinition = "FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE"))
    @Schema(description = "Parent collection this volume belongs to")
    private Collection collection;

    @NotNull
    @Column(name = "volume_number", nullable = false)
    @Schema(description = "Volume number within the collection", example = "19")
    private Integer volumeNumber;

    @Size(max = 500)
    @Column(name = "title", length = 500)
    @Schema(description = "Specific title of this volume (e.g., subtitle)", example = "The Philosopher's Stone")
    private String title;

    @Size(max = 255)
    @Column(name = "isbn", length = 255, unique = true)
    @Schema(description = "ISBN-13 or ISBN-10 of the volume", example = "978-4-06-381937-5")
    private String isbn;

    @Size(max = 255)
    @Column(name = "publisher", length = 255)
    @Schema(description = "Publisher of this volume", example = "Kodansha")
    private String publisher;

    @Column(name = "publication_date")
    @Schema(description = "Publication date of this volume", example = "2023-04-07")
    private LocalDate publicationDate;

    @Column(name = "page_count")
    @Schema(description = "Number of pages in this volume", example = "192")
    private Integer pageCount;

    @Size(max = 50)
    @Column(name = "language", length = 50)
    @Schema(description = "Language of this volume", example = "Japanese")
    private String language;

    @Column(name = "cover_image_url", length = 1000)
    @Schema(description = "URL to cover image", example = "https://example.com/cover.jpg")
    private String coverImageUrl;

    @Column(name = "active", nullable = false)
    @Schema(description = "Whether this volume is active", example = "true")
    private Boolean active = true;
}