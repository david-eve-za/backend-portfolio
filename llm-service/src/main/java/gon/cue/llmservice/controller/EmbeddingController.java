package gon.cue.llmservice.controller;

import gon.cue.llmservice.model.dto.EmbedRequest;
import gon.cue.llmservice.model.dto.EmbedResponse;
import gon.cue.llmservice.model.dto.RerankRequest;
import gon.cue.llmservice.model.dto.RerankResponse;
import gon.cue.llmservice.service.LLMProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/llm")
@Tag(name = "LLM Embeddings", description = "Embedding and rerank endpoints")
public class EmbeddingController {

    private final LLMProviderService llmProviderService;

    public EmbeddingController(LLMProviderService llmProviderService) {
        this.llmProviderService = llmProviderService;
    }

    @PostMapping("/embed")
    @Operation(summary = "Generate embeddings")
    public ResponseEntity<EmbedResponse> embed(@Valid @RequestBody EmbedRequest request) {
        EmbedResponse response = llmProviderService.embed(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rerank")
    @Operation(summary = "Rerank documents")
    public ResponseEntity<RerankResponse> rerank(@Valid @RequestBody RerankRequest request) {
        RerankResponse response = llmProviderService.rerank(request);
        return ResponseEntity.ok(response);
    }
}