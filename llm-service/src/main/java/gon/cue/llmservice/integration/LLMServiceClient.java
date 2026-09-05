package gon.cue.llmservice.integration;

import gon.cue.llmservice.model.dto.GenerateRequest;
import gon.cue.llmservice.model.dto.GenerateResponse;
import gon.cue.llmservice.model.dto.TranslateRequest;
import gon.cue.llmservice.model.dto.TranslateResponse;
import gon.cue.llmservice.model.dto.EmbedRequest;
import gon.cue.llmservice.model.dto.EmbedResponse;
import gon.cue.llmservice.model.dto.RerankRequest;
import gon.cue.llmservice.model.dto.RerankResponse;
import gon.cue.llmservice.model.enums.LLMProvider;
import gon.cue.llmservice.service.LLMProviderService;
import gon.cue.llmservice.service.TranslationService;
import org.springframework.web.client.RestClient;

public class LLMServiceClient {

    private final LLMServiceConfig config;
    private final LLMProviderService localService;
    private final TranslationService translationService;
    private final RestClient httpClient;

    private LLMServiceClient(LLMServiceConfig config, LLMProviderService localService, TranslationService translationService, RestClient httpClient) {
        this.config = config;
        this.localService = localService;
        this.translationService = translationService;
        this.httpClient = httpClient;
    }

    public static LLMServiceClient local(LLMProviderService localService, TranslationService translationService) {
        return new LLMServiceClient(
            new LLMServiceConfig(), 
            localService, 
            translationService,
            null
        );
    }

    public static LLMServiceClient http(String baseUrl) {
        RestClient client = RestClient.builder()
            .baseUrl(baseUrl)
            .build();
        return new LLMServiceClient(
            new LLMServiceConfig(IntegrationMode.HTTP_API, null, baseUrl, 30000, 3),
            null,
            null,
            client
        );
    }

    public GenerateResponse generate(String prompt, LLMProvider provider, Double temperature, Integer maxTokens) {
        GenerateRequest request = new GenerateRequest();
        request.setPrompt(prompt);
        request.setProvider(provider);
        request.setTemperature(temperature);
        request.setMaxTokens(maxTokens);

        if (config.getMode() == IntegrationMode.LOCAL) {
            return localService.generate(request);
        } else {
            return httpClient.post()
                .uri("/api/llm/generate")
                .body(request)
                .retrieve()
                .body(GenerateResponse.class);
        }
    }

    public TranslateResponse translate(String text, String sourceLang, String targetLang, LLMProvider provider) {
        TranslateRequest request = new TranslateRequest();
        request.setText(text);
        request.setSourceLang(sourceLang);
        request.setTargetLang(targetLang);
        request.setProvider(provider);

        if (config.getMode() == IntegrationMode.LOCAL) {
            return translationService.translate(request);
        } else {
            return httpClient.post()
                .uri("/api/llm/translate")
                .body(request)
                .retrieve()
                .body(TranslateResponse.class);
        }
    }

    public EmbedResponse embed(Object input, String model) {
        EmbedRequest request = new EmbedRequest();
        request.setInput(input);
        request.setModel(model);

        if (config.getMode() == IntegrationMode.LOCAL) {
            return localService.embed(request);
        } else {
            return httpClient.post()
                .uri("/api/llm/embed")
                .body(request)
                .retrieve()
                .body(EmbedResponse.class);
        }
    }

    public RerankResponse rerank(String query, java.util.List<String> documents, int topN, String model) {
        RerankRequest request = new RerankRequest();
        request.setQuery(query);
        request.setDocuments(documents);
        request.setTopN(topN);
        request.setModel(model);

        if (config.getMode() == IntegrationMode.LOCAL) {
            return localService.rerank(request);
        } else {
            return httpClient.post()
                .uri("/api/llm/rerank")
                .body(request)
                .retrieve()
                .body(RerankResponse.class);
        }
    }
}