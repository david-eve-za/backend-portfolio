package gon.cue.llmservice.controller;

import gon.cue.llmservice.model.dto.ProviderInfo;
import gon.cue.llmservice.model.enums.LLMProvider;
import gon.cue.llmservice.service.ProviderFactory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/llm")
@Tag(name = "LLM Providers", description = "Provider information endpoints")
public class ProviderController {

    private final ProviderFactory providerFactory;

    public ProviderController(ProviderFactory providerFactory) {
        this.providerFactory = providerFactory;
    }

    @GetMapping("/providers")
    @Operation(summary = "List available providers")
    public ResponseEntity<ProviderInfo> getProviders() {
        ProviderInfo info = new ProviderInfo();
        info.setDefaultProvider(providerFactory.getDefaultProvider());
        info.setAvailableProviders(LLMProvider.values());
        return ResponseEntity.ok(info);
    }
}