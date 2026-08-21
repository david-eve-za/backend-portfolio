package gon.cue.llmservice.controller;

import gon.cue.llmservice.model.dto.TranslateRequest;
import gon.cue.llmservice.model.dto.TranslateResponse;
import gon.cue.llmservice.service.TranslationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/llm")
@Tag(name = "LLM Translation", description = "Translation endpoints")
public class TranslationController {

    private final TranslationService translationService;

    public TranslationController(TranslationService translationService) {
        this.translationService = translationService;
    }

    @PostMapping("/translate")
    @Operation(summary = "Translate text using LLM")
    public ResponseEntity<TranslateResponse> translate(@Valid @RequestBody TranslateRequest request) {
        TranslateResponse response = translationService.translate(request);
        return ResponseEntity.ok(response);
    }
}