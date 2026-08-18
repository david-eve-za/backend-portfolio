package gon.cue.crud.controller;

import gon.cue.crud.dto.SampleEntityDto;
import gon.cue.crud.dto.SampleEntityRequest;
import gon.cue.crud.mapper.SampleEntityMapper;
import gon.cue.crud.model.SampleEntity;
import gon.cue.crud.service.port.SampleEntityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sample-entities")
@RequiredArgsConstructor
@Tag(name = "Sample Entities", description = "CRUD operations for sample entities")
public class SampleEntityController {

    private final SampleEntityService service;
    private final SampleEntityMapper mapper;

    @GetMapping
    @Operation(summary = "Get all active sample entities", description = "Returns a list of all non-deleted sample entities")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved list",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SampleEntityDto.class)))
    })
    public ResponseEntity<List<SampleEntityDto>> getAll() {
        List<SampleEntityDto> entities = service.findAll().stream()
                .map(mapper::toDto)
                .toList();
        return ResponseEntity.ok(entities);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sample entity by ID", description = "Returns a single sample entity by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved entity",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SampleEntityDto.class))),
            @ApiResponse(responseCode = "404", description = "Entity not found",
                    content = @Content)
    })
    public ResponseEntity<SampleEntityDto> getById(
            @Parameter(description = "ID of the entity to retrieve") @PathVariable Long id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new sample entity", description = "Creates a new sample entity")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Entity created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SampleEntityDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input",
                    content = @Content)
    })
    public ResponseEntity<SampleEntityDto> create(@Valid @RequestBody SampleEntityRequest request) {
        SampleEntity entity = mapper.toEntity(request);
        SampleEntity saved = service.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(saved));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a sample entity", description = "Updates an existing sample entity")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entity updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SampleEntityDto.class))),
            @ApiResponse(responseCode = "404", description = "Entity not found",
                    content = @Content),
            @ApiResponse(responseCode = "400", description = "Invalid input",
                    content = @Content)
    })
    public ResponseEntity<SampleEntityDto> update(
            @Parameter(description = "ID of the entity to update") @PathVariable Long id,
            @Valid @RequestBody SampleEntityRequest request) {
        return service.findById(id)
                .map(existing -> {
                    mapper.updateEntityFromRequest(request, existing);
                    SampleEntity saved = service.save(existing);
                    return ResponseEntity.ok(mapper.toDto(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a sample entity", description = "Soft deletes a sample entity by marking it as deleted")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Entity deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Entity not found")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID of the entity to delete") @PathVariable Long id) {
        if (service.existsById(id)) {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search sample entities by name", description = "Searches for sample entities by name (case-insensitive, partial match)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved list",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SampleEntityDto.class)))
    })
    public ResponseEntity<List<SampleEntityDto>> searchByName(
            @Parameter(description = "Name to search for") @RequestParam String name) {
        List<SampleEntityDto> entities = service.searchByName(name).stream()
                .map(mapper::toDto)
                .toList();
        return ResponseEntity.ok(entities);
    }
}