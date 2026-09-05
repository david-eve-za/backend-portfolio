package gon.cue.crud.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "sections", indexes = {
    @Index(name = "idx_section_volume", columnList = "volume_id"),
    @Index(name = "idx_section_volume_number", columnList = "volume_id, section_number"),
    @Index(name = "idx_section_type", columnList = "section_type"),
    @Index(name = "idx_section_deleted", columnList = "deleted")
})
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Section/chapter within a volume (Prologue, Chapter 1, Epilogue, etc.)")
public class Section extends BaseEntity {

    public enum SectionType {
        PROLOGUE,
        CHAPTER,
        EPILOGUE,
        INTERLUDE,
        AFTERWORD,
        APPENDIX,
        OTHER
    }

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "volume_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_section_volume", foreignKeyDefinition = "FOREIGN KEY (volume_id) REFERENCES volumes(id) ON DELETE CASCADE"))
    @Schema(description = "Parent volume this section belongs to")
    private Volume volume;

    @NotNull
    @Column(name = "section_number", nullable = false)
    @Schema(description = "Section/chapter number within the volume", example = "1")
    private Integer sectionNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "section_type", nullable = false, length = 20)
    @Schema(description = "Type of section", example = "CHAPTER")
    private SectionType sectionType;

    @Size(max = 500)
    @Column(name = "title", length = 500)
    @Schema(description = "Title of the section/chapter", example = "The Boy Who Lived")
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    @Schema(description = "Full text content of the section")
    private String content;

    @Column(name = "word_count")
    @Schema(description = "Word count of the section", example = "3500")
    private Integer wordCount;

    @Column(name = "page_start")
    @Schema(description = "Starting page number in physical book", example = "1")
    private Integer pageStart;

    @Column(name = "page_end")
    @Schema(description = "Ending page number in physical book", example = "15")
    private Integer pageEnd;

    @Column(name = "active", nullable = false)
    @Schema(description = "Whether this section is active", example = "true")
    private Boolean active = true;
}