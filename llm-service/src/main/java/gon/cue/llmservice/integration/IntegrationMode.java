package gon.cue.llmservice.integration;

public enum IntegrationMode {
    LOCAL,      // In-process via ProviderFactory
    HTTP_API    // REST API to remote LLM service
}