package gon.cue.crud.controller;

import gon.cue.crud.dto.CollectionRequest;
import gon.cue.crud.model.Collection;
import gon.cue.crud.service.port.CollectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collections")
@RequiredArgsConstructor
@Tag(name = "Collections", description = "CRUD operations for book collections")
public class CollectionController {

    private final CollectionService service;

    @GetMapping
    @Operation(summary = "List all collections", description = "Returns all non-deleted collections ordered by creation date (newest first)")
    public ResponseEntity<List<Collection>> getAll() {
        return ResponseEntity.ok(service.findAllOrderedByCreatedAtDesc());
    }

    @GetMapping("/search")
    @Operation(summary = "Search collections by name", description = "Case-insensitive partial match on collection name")
    public ResponseEntity<List<Collection>> search(@RequestParam String name) {
        return ResponseEntity.ok(service.searchByName(name));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get collection by ID")
    public ResponseEntity<Collection> getById(@PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a collection")
    public ResponseEntity<Collection> create(@Valid @RequestBody CollectionRequest request) {
        Collection entity = new Collection();
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setPublisher(request.getPublisher());
        entity.setPublicationDate(request.getPublicationDate());
        entity.setLanguage(request.getLanguage());
        entity.setTotalVolumes(request.getTotalVolumes());
        entity.setActive(request.getActive());
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(entity));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a collection")
    public ResponseEntity<Collection> update(@PathVariable UUID id, @Valid @RequestBody CollectionRequest request) {
        return service.findById(id)
                .map(existing -> {
                    existing.setName(request.getName());
                    existing.setDescription(request.getDescription());
                    existing.setPublisher(request.getPublisher());
                    existing.setPublicationDate(request.getPublicationDate());
                    existing.setLanguage(request.getLanguage());
                    existing.setTotalVolumes(request.getTotalVolumes());
                    existing.setActive(request.getActive());
                    return ResponseEntity.ok(service.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a collection")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (service.existsById(id)) {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}