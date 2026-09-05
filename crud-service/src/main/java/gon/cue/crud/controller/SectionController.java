package gon.cue.crud.controller;

import gon.cue.crud.dto.SectionRequest;
import gon.cue.crud.model.Section;
import gon.cue.crud.model.Section.SectionType;
import gon.cue.crud.service.port.SectionService;
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
@Tag(name = "Sections", description = "CRUD operations for sections/chapters within volumes")
public class SectionController {

    private final SectionService sectionService;
    private final VolumeService volumeService;

    @GetMapping("/volumes/{volumeId}/sections")
    @Operation(summary = "List sections of a volume", description = "Returns all sections of the given volume ordered by section number")
    public ResponseEntity<List<Section>> listByVolume(@PathVariable UUID volumeId,
                                                       @RequestParam(required = false) SectionType type) {
        if (type != null) {
            return ResponseEntity.ok(sectionService.findByVolumeIdAndType(volumeId, type));
        }
        return ResponseEntity.ok(sectionService.findByVolumeIdOrderBySectionNumber(volumeId));
    }

    @PostMapping("/volumes/{volumeId}/sections")
    @Operation(summary = "Create a section in a volume")
    public ResponseEntity<Section> create(@PathVariable UUID volumeId, @Valid @RequestBody SectionRequest request) {
        return volumeService.findById(volumeId)
                .map(volume -> {
                    Section entity = new Section();
                    entity.setSectionNumber(request.getSectionNumber());
                    entity.setSectionType(request.getSectionType());
                    entity.setTitle(request.getTitle());
                    entity.setContent(request.getContent());
                    entity.setWordCount(request.getWordCount());
                    entity.setPageStart(request.getPageStart());
                    entity.setPageEnd(request.getPageEnd());
                    entity.setActive(request.getActive());
                    entity.setVolume(volume);
                    return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.save(entity));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sections/search")
    @Operation(summary = "Search sections by title")
    public ResponseEntity<List<Section>> search(@RequestParam String title) {
        return ResponseEntity.ok(sectionService.searchByTitle(title));
    }

    @GetMapping("/sections/{id}")
    @Operation(summary = "Get section by ID")
    public ResponseEntity<Section> getById(@PathVariable UUID id) {
        return sectionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/sections/{id}")
    @Operation(summary = "Update a section")
    public ResponseEntity<Section> update(@PathVariable UUID id, @Valid @RequestBody SectionRequest request) {
        return sectionService.findById(id)
                .map(existing -> {
                    existing.setSectionNumber(request.getSectionNumber());
                    existing.setSectionType(request.getSectionType());
                    existing.setTitle(request.getTitle());
                    existing.setContent(request.getContent());
                    existing.setWordCount(request.getWordCount());
                    existing.setPageStart(request.getPageStart());
                    existing.setPageEnd(request.getPageEnd());
                    existing.setActive(request.getActive());
                    return ResponseEntity.ok(sectionService.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/sections/{id}")
    @Operation(summary = "Soft delete a section")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (sectionService.existsById(id)) {
            sectionService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}