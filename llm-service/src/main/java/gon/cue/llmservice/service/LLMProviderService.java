package gon.cue.llmservice.service;

import gon.cue.llmservice.config.LlmServiceProperties;
import gon.cue.llmservice.model.dto.*;
import gon.cue.llmservice.model.enums.LLMProvider;
import gon.cue.llmservice.service.tokenizer.DJLTokenizer;
import gon.cue.llmservice.service.tokenizer.TokenizerRegistry;
import gon.cue.llmservice.service.tokenizer.TokenizerType;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingOptions;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.ai.embedding.Embedding;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@EnableRetry
public class LLMProviderService {

    private final ProviderFactory providerFactory;
    private final TokenChunkCalculator chunkCalculator;
    private final TokenizerRegistry tokenizerRegistry;

    public LLMProviderService(ProviderFactory providerFactory,
                               TokenChunkCalculator chunkCalculator,
                               TokenizerRegistry tokenizerRegistry) {
        this.providerFactory = providerFactory;
        this.chunkCalculator = chunkCalculator;
        this.tokenizerRegistry = tokenizerRegistry;
    }

    @Retryable(maxAttempts = 3)
    public GenerateResponse generate(GenerateRequest request) {
        LLMProvider provider = request.getProvider() != null ? request.getProvider() : providerFactory.getDefaultProvider();
        ChatModel chatModel = providerFactory.getChatModel(provider);

        Prompt prompt = new Prompt(request.getPrompt());
        if (request.getTemperature() != null || request.getMaxTokens() != null) {
            // Build options programmatically
            prompt = buildPromptWithOptions(request.getPrompt(), request.getTemperature(), request.getMaxTokens());
        }

        ChatResponse response = chatModel.call(prompt);
        String content = response.getResult().getOutput().getText();

        GenerateResponse result = new GenerateResponse();
        result.setContent(content);
        result.setModelName(getModelName(provider));
        result.setProvider(provider);
        
        // Extract token usage if available
        var metadata = response.getMetadata();
        if (metadata != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> metadataMap = (Map<String, Object>) metadata;
                Object usageObj = metadataMap.get("tokenUsage");
                if (usageObj != null) {
                    // Use reflection to extract token usage fields
                    GenerateResponse.TokenUsage tokenUsage = new GenerateResponse.TokenUsage();
                    try {
                        var promptTokensMethod = usageObj.getClass().getMethod("getPromptTokens");
                        var completionTokensMethod = usageObj.getClass().getMethod("getCompletionTokens");
                        var totalTokensMethod = usageObj.getClass().getMethod("getTotalTokens");
                        
                        tokenUsage.setPromptTokens((Integer) promptTokensMethod.invoke(usageObj));
                        tokenUsage.setCompletionTokens((Integer) completionTokensMethod.invoke(usageObj));
                        tokenUsage.setTotalTokens((Integer) totalTokensMethod.invoke(usageObj));
                        result.setTokenUsage(tokenUsage);
                    } catch (Exception ignored) {
                        // Token usage methods not available, skip
                    }
                }
            } catch (Exception ignored) {
                // Token usage not available, skip
            }
        }

        return result;
    }

    public GenerateResponse translate(TranslateRequest request) {
        LLMProvider provider = request.getProvider() != null ? request.getProvider() : providerFactory.getDefaultProvider();
        
        if (LLMProvider.NVIDIA.equals(provider)) {
            return translateWithNvidiaAdaptive(request);
        } else {
            return translateStandard(request, provider);
        }
    }

    private GenerateResponse translateWithNvidiaAdaptive(TranslateRequest request) {
        DJLTokenizer tokenizer = tokenizerRegistry.getTokenizer(
            "gpt2", 
            TokenizerType.HUGGINGFACE
        );

        int chunkSize = chunkCalculator.calculateChunkSize(
            request.getSourceLang(), request.getTargetLang(), tokenizer
        );

        List<String> chunks = chunkCalculator.splitText(request.getText(), chunkSize, tokenizer);

        StringBuilder translation = new StringBuilder();
        for (String chunk : chunks) {
            TranslateRequest chunkRequest = new TranslateRequest();
            chunkRequest.setText(chunk);
            chunkRequest.setSourceLang(request.getSourceLang());
            chunkRequest.setTargetLang(request.getTargetLang());
            chunkRequest.setProvider(LLMProvider.NVIDIA);

            GenerateResponse chunkResponse = translateStandard(chunkRequest, LLMProvider.NVIDIA);
            translation.append(chunkResponse.getContent());
        }

        GenerateResponse response = new GenerateResponse();
        response.setContent(translation.toString());
        response.setModelName("openai/gpt-oss-120b");
        response.setProvider(LLMProvider.NVIDIA);
        return response;
    }

    private GenerateResponse translateStandard(TranslateRequest request, LLMProvider provider) {
        ChatModel chatModel = providerFactory.getChatModel(provider);
        
        String prompt = String.format(
            "Translate the following text from %s to %s:\n\n%s\n\nTranslation:",
            request.getSourceLang(), request.getTargetLang(), request.getText()
        );

        ChatResponse response = chatModel.call(new Prompt(prompt));
        String content = response.getResult().getOutput().getText();

        GenerateResponse result = new GenerateResponse();
        result.setContent(content);
        result.setModelName(getModelName(provider));
        result.setProvider(provider);
        return result;
    }

    public EmbedResponse embed(EmbedRequest request) {
        EmbeddingModel embeddingModel = providerFactory.getQueryEmbeddingModel(LLMProvider.NVIDIA);
        
        List<String> texts;
        if (request.getInput() instanceof String) {
            texts = List.of((String) request.getInput());
        } else if (request.getInput() instanceof List) {
            texts = (List<String>) request.getInput();
        } else {
            throw new IllegalArgumentException("Input must be String or List<String>");
        }

        EmbeddingResponse response = embeddingModel.call(
            new org.springframework.ai.embedding.EmbeddingRequest(texts, EmbeddingOptions.builder().build())
        );

        EmbedResponse result = new EmbedResponse();
        result.setData(response.getResults().stream().map(r -> {
            EmbedResponse.Embedding e = new EmbedResponse.Embedding();
            e.setIndex(r.getIndex());
            float[] embeddingArray = r.getOutput();
            List<Float> embeddingList = new ArrayList<>(embeddingArray.length);
            for (float f : embeddingArray) {
                embeddingList.add(f);
            }
            e.setEmbedding(embeddingList);
            return e;
        }).collect(Collectors.toList()));
        result.setModel("nvidia/nv-embedqa-e5-v5");
        
        EmbedResponse.Usage usage = new EmbedResponse.Usage();
        var metadata = response.getMetadata();
        if (metadata != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> metadataMap = (Map<String, Object>) metadata;
                Object tokenUsageObj = metadataMap.get("tokenUsage");
                if (tokenUsageObj != null) {
                    try {
                        var promptTokensMethod = tokenUsageObj.getClass().getMethod("getPromptTokens");
                        var totalTokensMethod = tokenUsageObj.getClass().getMethod("getTotalTokens");
                        
                        usage.setPromptTokens((Integer) promptTokensMethod.invoke(tokenUsageObj));
                        usage.setTotalTokens((Integer) totalTokensMethod.invoke(tokenUsageObj));
                    } catch (Exception ignored) {
                        // Token usage methods not available, skip
                    }
                }
            } catch (Exception ignored) {
                // Token usage not available, skip
            }
        }
        result.setUsage(usage);
        return result;
    }

    public RerankResponse rerank(RerankRequest request) {
        // Placeholder - NVIDIA rerank requires different endpoint
        // For now, return documents in original order with mock scores
        RerankResponse response = new RerankResponse();
        response.setResults(request.getDocuments().stream().map(doc -> {
            RerankResponse.RerankResult result = new RerankResponse.RerankResult();
            result.setIndex(request.getDocuments().indexOf(doc));
            result.setRelevanceScore(1.0);
            result.setDocument(doc);
            return result;
        }).limit(request.getTopN()).collect(Collectors.toList()));
        return response;
    }

    private String getModelName(LLMProvider provider) {
        return switch (provider) {
            case NVIDIA -> "openai/gpt-oss-120b";
            case OLLAMA -> "llama3.2";
        };
    }

    private Prompt buildPromptWithOptions(String prompt, Double temperature, Integer maxTokens) {
        // Spring AI options building would go here
        return new Prompt(prompt);
    }
}