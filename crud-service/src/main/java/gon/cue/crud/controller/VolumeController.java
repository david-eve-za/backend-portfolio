package gon.cue.crud.controller;

import gon.cue.crud.dto.VolumeRequest;
import gon.cue.crud.model.Volume;
import gon.cue.crud.service.port.CollectionService;
import gon.cue.crud.service.port.VolumeService;
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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Volumes", description = "CRUD operations for volumes/books within collections")
public class VolumeController {

    private final VolumeService volumeService;
    private final CollectionService collectionService;

    @GetMapping("/collections/{collectionId}/volumes")
    @Operation(summary = "List volumes of a collection", description = "Returns all volumes of the given collection ordered by volume number")
    public ResponseEntity<List<Volume>> listByCollection(@PathVariable UUID collectionId) {
        return ResponseEntity.ok(volumeService.findByCollectionIdOrderByVolumeNumber(collectionId));
    }

    @PostMapping("/collections/{collectionId}/volumes")
    @Operation(summary = "Create a volume in a collection")
    public ResponseEntity<Volume> create(@PathVariable UUID collectionId, @Valid @RequestBody VolumeRequest request) {
        return collectionService.findById(collectionId)
                .map(collection -> {
                    Volume entity = new Volume();
                    entity.setVolumeNumber(request.getVolumeNumber());
                    entity.setTitle(request.getTitle());
                    entity.setIsbn(request.getIsbn());
                    entity.setPublisher(request.getPublisher());
                    entity.setPublicationDate(request.getPublicationDate());
                    entity.setPageCount(request.getPageCount());
                    entity.setLanguage(request.getLanguage());
                    entity.setCoverImageUrl(request.getCoverImageUrl());
                    entity.setActive(request.getActive());
                    entity.setCollection(collection);
                    return ResponseEntity.status(HttpStatus.CREATED).body(volumeService.save(entity));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/volumes/recent")
    @Operation(summary = "Most recent volumes across all collections")
    public ResponseEntity<List<Volume>> recent() {
        return ResponseEntity.ok(volumeService.findAllOrderedByCreatedAtDesc());
    }

    @GetMapping("/volumes/search")
    @Operation(summary = "Search volumes by title")
    public ResponseEntity<List<Volume>> search(@RequestParam String title) {
        return ResponseEntity.ok(volumeService.searchByTitle(title));
    }

    @GetMapping("/volumes/{id}")
    @Operation(summary = "Get volume by ID")
    public ResponseEntity<Volume> getById(@PathVariable UUID id) {
        return volumeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/volumes/{id}")
    @Operation(summary = "Update a volume")
    public ResponseEntity<Volume> update(@PathVariable UUID id, @Valid @RequestBody VolumeRequest request) {
        return volumeService.findById(id)
                .map(existing -> {
                    existing.setVolumeNumber(request.getVolumeNumber());
                    existing.setTitle(request.getTitle());
                    existing.setIsbn(request.getIsbn());
                    existing.setPublisher(request.getPublisher());
                    existing.setPublicationDate(request.getPublicationDate());
                    existing.setPageCount(request.getPageCount());
                    existing.setLanguage(request.getLanguage());
                    existing.setCoverImageUrl(request.getCoverImageUrl());
                    existing.setActive(request.getActive());
                    return ResponseEntity.ok(volumeService.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/volumes/{id}")
    @Operation(summary = "Soft delete a volume")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (volumeService.existsById(id)) {
            volumeService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}