package gon.cue.llmservice.controller;

import gon.cue.llmservice.model.dto.GenerateRequest;
import gon.cue.llmservice.model.dto.GenerateResponse;
import gon.cue.llmservice.service.LLMProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/llm")
@Tag(name = "LLM Generation", description = "Text generation endpoints")
public class GenerateController {

    private final LLMProviderService llmProviderService;

    public GenerateController(LLMProviderService llmProviderService) {
        this.llmProviderService = llmProviderService;
    }

    @PostMapping("/generate")
    @Operation(summary = "Generate text using LLM")
    public ResponseEntity<GenerateResponse> generate(@Valid @RequestBody GenerateRequest request) {
        GenerateResponse response = llmProviderService.generate(request);
        return ResponseEntity.ok(response);
    }
}