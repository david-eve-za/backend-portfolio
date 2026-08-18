package gon.cue.crud.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "sample_entity")
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Sample entity for CRUD operations")
public class SampleEntity extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", nullable = false, length = 100)
    @Schema(description = "Name of the entity", example = "Sample Item")
    private String name;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    @Schema(description = "Description of the entity", example = "This is a sample item")
    private String description;

    @Column(name = "active", nullable = false)
    @Schema(description = "Whether the entity is active", example = "true")
    private Boolean active = true;
}