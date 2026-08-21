package gon.cue.llmservice.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.splitter.DocumentBySentenceSplitter;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.TokenCountEstimator;
import gon.cue.llmservice.config.LlmServiceProperties;
import gon.cue.llmservice.config.ProviderConfig;
import gon.cue.llmservice.service.tokenizer.DJLTokenizer;
import gon.cue.llmservice.service.tokenizer.TokenizerRegistry;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class TokenChunkCalculator {

    private static final Map<String, Double> DEFAULT_EXPANSION_RATIOS = Map.ofEntries(
        Map.entry("en-es", 1.30), Map.entry("en-pt", 1.25), Map.entry("en-fr", 1.15),
        Map.entry("en-it", 1.10), Map.entry("en-de", 1.20), Map.entry("en-nl", 1.15),
        Map.entry("en-pl", 1.20), Map.entry("en-ru", 1.15), Map.entry("en-ar", 1.15),
        Map.entry("en-zh", 0.55), Map.entry("en-ja", 0.60), Map.entry("en-ko", 0.65),
        Map.entry("en-hi", 1.10),
        Map.entry("es-en", 0.80), Map.entry("fr-en", 0.85), Map.entry("de-en", 0.85),
        Map.entry("zh-en", 1.80), Map.entry("ja-en", 1.70), Map.entry("ko-en", 1.60),
        Map.entry("ru-en", 0.90), Map.entry("ar-en", 0.90)
    );

    private final TokenizerRegistry tokenizerRegistry;
    private final ProviderConfig.NvidiaConfig nvidiaConfig;
    private final DocumentBySentenceSplitter defaultSplitter;
    private String translationPromptTemplate;

    public TokenChunkCalculator(TokenizerRegistry tokenizerRegistry,
                                 ProviderConfig config,
                                 DocumentBySentenceSplitter defaultSplitter,
                                 LlmServiceProperties properties) {
        this.tokenizerRegistry = tokenizerRegistry;
        this.nvidiaConfig = config.nvidia();
        this.defaultSplitter = defaultSplitter;
        loadPromptTemplate(properties.translationPromptPath());
    }

    private void loadPromptTemplate(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path.replace("classpath:", ""));
            this.translationPromptTemplate = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load translation prompt template", e);
        }
    }

    public int calculateChunkSize(String sourceLang, String targetLang, DJLTokenizer tokenizer) {
        String key = sourceLang + "-" + targetLang;
        double expansionRatio = DEFAULT_EXPANSION_RATIOS.getOrDefault(key, 1.15);
        
        if (nvidiaConfig.expansionRatios() != null && nvidiaConfig.expansionRatios().containsKey(key)) {
            expansionRatio = nvidiaConfig.expansionRatios().get(key);
        }

        String samplePrompt = translationPromptTemplate
            .replace("{text_chunk}", "Sample text for token measurement.")
            .replace("{source_lang}", sourceLang)
            .replace("{target_lang}", targetLang);
        int promptTokens = tokenizer.countTokens(samplePrompt);

        double margin = 1.0 - nvidiaConfig.chunkSafetyMarginPct();
        
        int byOutput = (int) ((nvidiaConfig.maxOutputTokens() / expansionRatio) * margin);
        
        int availableContext = nvidiaConfig.contextSize() - promptTokens - nvidiaConfig.maxOutputTokens();
        int byContext = Math.max(0, (int) (availableContext * margin));
        
        int chunkSize = Math.min(Math.min(byOutput, byContext), nvidiaConfig.maxChunkTokens());
        return Math.max(chunkSize, nvidiaConfig.minChunkTokens());
    }

    public List<String> splitText(String text, int chunkSize, DJLTokenizer tokenizer) {
        TokenCountEstimator estimator = new TokenCountEstimator() {
            @Override
            public int estimateTokenCountInText(String text) {
                return tokenizer.countTokens(text);
            }

            @Override
            public int estimateTokenCountInMessage(dev.langchain4j.data.message.ChatMessage message) {
                // For text-based messages, extract text content
                if (message instanceof dev.langchain4j.data.message.UserMessage userMessage) {
                    return tokenizer.countTokens(userMessage.singleText());
                } else if (message instanceof dev.langchain4j.data.message.AiMessage aiMessage) {
                    return tokenizer.countTokens(aiMessage.text());
                } else if (message instanceof dev.langchain4j.data.message.SystemMessage systemMessage) {
                    return tokenizer.countTokens(systemMessage.text());
                }
                return 0;
            }

            @Override
            public int estimateTokenCountInMessages(java.lang.Iterable<dev.langchain4j.data.message.ChatMessage> messages) {
                int total = 0;
                for (dev.langchain4j.data.message.ChatMessage message : messages) {
                    total += estimateTokenCountInMessage(message);
                }
                return total;
            }
        };

        DocumentBySentenceSplitter configuredSplitter = new DocumentBySentenceSplitter(chunkSize, 50, estimator);
        
        List<TextSegment> segments = configuredSplitter.split(Document.from(text));
        return segments.stream().map(TextSegment::text).toList();
    }

    public double getExpansionRatio(String sourceLang, String targetLang) {
        String key = sourceLang + "-" + targetLang;
        return DEFAULT_EXPANSION_RATIOS.getOrDefault(key, 1.15);
    }
}