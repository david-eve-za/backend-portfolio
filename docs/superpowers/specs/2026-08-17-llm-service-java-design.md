# Design Specification: llm-service Module (Java/Spring Boot)

**Date:** 2026-08-17
**Project:** backend-portfolio (Spring Boot 4.1.0 / Spring Cloud 2025.1.2 / Java 21)
**Status:** Approved

---

## 1. Overview

Add a new microservice module `llm-service` that provides multi-provider LLM capabilities (NVIDIA NIM, Ollama) via REST API, integrating with the existing Spring Cloud ecosystem: Eureka service discovery, Config Server for configuration, API Gateway for routing, and Security Module for JWT-based authentication.

### 1.1 Purpose

- Serve as the foundational LLM service for the microservices platform
- Provide a template for AI-powered services
- Demonstrate complete Spring Cloud + Spring AI integration pattern
- Enable local-only LLM inference with NVIDIA NIM and Ollama
- Support adaptive token-aware text chunking for translation workflows

### 1.2 Scope

**In Scope:**
- New Maven module `llm-service` added to parent POM
- Spring AI native ChatModel integration (OllamaChatModel, OpenAiChatModel for NVIDIA)
- DJL HuggingFaceTokenizer for precise token counting
- Apache OpenNLP for sentence-aware text splitting (English/Spanish models bundled)
- Adaptive chunking logic ported from Python (TokenChunkCalculator)
- JWT Resource Server security (validates tokens from security-module)
- Springdoc OpenAPI 3 / Swagger UI integration
- Eureka registration, Config Server discovery, Gateway routing
- Actuator health/metrics endpoints
- Unit and integration tests
- REST API: `/generate`, `/translate`, `/health`, `/providers`

**Out of Scope:**
- Gemini provider (Python-only, not needed for Java)
- Event-driven architecture (async messaging)
- Remote HTTP API mode (local-only integration)
- Vector stores / embeddings (future)
- Fine-tuning / training workflows

---

## 2. Architecture

### 2.1 System Context

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   API Gateway   │────▶│   llm-service    │────▶│   Ollama (local)   │
│   (port 8080)   │     │   (port 8083)    │     │   localhost:11434  │
└────────┬────────┘     └────────┬─────────┘     └────────────────────┘
         │                       │
         │           ┌───────────┴───────────┐
         │           │                       │
         ▼           ▼                       ▼
┌─────────────────┐ ┌──────────────┐ ┌────────────────────┐
│  Eureka Server  │ │ Config Server│ │  NVIDIA NIM API    │
│  (port 8761)    │ │ (port 8888)  │ │  integrate.api.nv  │
└─────────────────┘ └──────────────┘ └────────────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
       └───────────────────┴───────────────────┘
                    Service Discovery
```

### 2.2 Module Structure (SOLID Clean Architecture)

```
llm-service/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── gon/cue/llm/
│   │   │       ├── LlmServiceApplication.java
│   │   │       ├── config/
│   │   │       │   ├── DataSourceConfig.java        (if needed for future)
│   │   │       │   ├── JpaConfig.java               (if needed for future)
│   │   │       │   ├── SecurityConfig.java          (JWT Resource Server)
│   │   │       │   ├── SwaggerConfig.java           (OpenAPI 3)
│   │   │       │   ├── WebConfig.java               (CORS, WebMvc)
│   │   │       │   ├── LlmProperties.java           (@ConfigurationProperties)
│   │   │       │   ├── NvidiaConfig.java            (NVIDIA-specific props)
│   │   │       │   ├── OllamaConfig.java            (Ollama-specific props)
│   │   │       │   └── TokenizerConfig.java         (DJL tokenizer beans)
│   │   │       ├── controller/
│   │   │       │   ├── GenerateController.java      (POST /generate)
│   │   │       │   ├── TranslateController.java     (POST /translate)
│   │   │       │   ├── HealthController.java        (GET /health)
│   │   │       │   └── ProviderController.java      (GET /providers)
│   │   │       ├── model/
│   │   │       │   ├── LlmRequest.java              (Request DTO)
│   │   │       │   ├── LlmResponse.java             (Response DTO)
│   │   │       │   ├── TranslateRequest.java
│   │   │       │   └── TranslateResponse.java
│   │   │       ├── service/
│   │   │       │   ├── port/
│   │   │       │   │   ├── LlmClient.java           (Port interface)
│   │   │       │   │   ├── TokenCounter.java        (Port interface)
│   │   │       │   │   └── TextSplitter.java        (Port interface)
│   │   │       │   └── adapter/
│   │   │       │       ├── NvidiaLlmAdapter.java    (NVIDIA implementation)
│   │   │       │       ├── OllamaLlmAdapter.java    (Ollama implementation)
│   │   │       │       ├── DjiTokenizerAdapter.java (DJL tokenizer impl)
│   │   │       │       └── OpenNlpTextSplitter.java (OpenNLP splitter impl)
│   │   │       ├── factory/
│   │   │       │   └── LlmFactory.java              (Factory for providers)
│   │   │       ├── chunking/
│   │   │       │   ├── TokenChunkCalculator.java    (Adaptive chunking)
│   │   │       │   └── ExpansionRatios.java         (Language pair ratios)
│   │   │       └── integration/
│   │   │           ├── LlmServiceClient.java        (High-level client)
│   │   │           └── LlmIntegrationMixin.java     (Mixin for services)
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── bootstrap.yml
│   │       └── opennlp/
│   │           ├── en-sent.bin                      (English sentence model)
│   │           └── es-sent.bin                      (Spanish sentence model)
│   └── test/
│       └── java/gon/cue/llm/
│           ├── LlmServiceApplicationTests.java
│           ├── adapter/
│           │   ├── NvidiaLlmAdapterTest.java
│           │   ├── OllamaLlmAdapterTest.java
│           │   ├── DjiTokenizerAdapterTest.java
│           │   └── OpenNlpTextSplitterTest.java
│           ├── chunking/
│           │   └── TokenChunkCalculatorTest.java
│           └── controller/
│               ├── GenerateControllerTest.java
│               └── TranslateControllerTest.java
└── target/
```

---

## 3. Configuration

### 3.1 bootstrap.yml

```yaml
spring:
  application:
    name: llm-service
  cloud:
    config:
      discovery:
        enabled: true
        service-id: configserver
      fail-fast: true
      retry:
        initial-interval: 2000
        max-attempts: 6
        multiplier: 1.5
```

### 3.2 application.yml

```yaml
server:
  port: 8083

spring:
  application:
    name: llm-service
  # OpenNLP models loaded from classpath
  # No database needed for this service

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    register-with-eureka: true
    fetch-registry: true
  instance:
    hostname: localhost
    prefer-ip-address: false
    lease-renewal-interval-in-seconds: 10
    lease-expiration-duration-in-seconds: 30

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  endpoint:
    health:
      show-details: always
      probes:
        enabled: true
  tracing:
    enabled: true
    sampling:
      probability: 1.0
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: method
    tags-sorter: alpha
    disable-swagger-default-url: true
  packages-to-scan: gon.cue.llm.controller
  paths-to-match: /api/**

# LLM Service Configuration
llm:
  general:
    service-name: llm-service
    service-version: 0.1.0
    log-level: INFO
    default-provider: NVIDIA
    tokenizer-cache-dir: ./data/tokenizers

  nvidia:
    model-name: mistralai/mistral-large-3-675b-instruct-2512
    temperature: 0.2
    top-p: 0.95
    max-output-tokens: 8192
    rate-limit: 30
    retry-attempts: 6
    request-timeout: 3600
    max-bucket-size: 10
    context-size: 131072
    chunk-safety-margin-pct: 0.15
    max-chunk-tokens: 32768
    min-chunk-tokens: 512
    local-tokenizer-name: mistralai/Mistral-Large-3-675B-Instruct-2512
    local-tokenizer-dir: mistral-large-3-675b-instruct-2512
    # NVIDIA NIM endpoint
    base-url: https://integrate.api.nvidia.com/v1
    api-key: ${LLM_NVIDIA_API_KEY:}

  ollama:
    model-name: llama3.2
    temperature: 0.3
    top-p: 0.9
    context-size: 4096
    validate-model: true
    local-tokenizer-name: meta-llama/Llama-3.2-1B
    local-tokenizer-dir: .tokenizers/ollama
    model-id: meta-llama/Llama-3.1-8B-Instruct
    base-url: http://localhost:11434

  # OpenNLP sentence detection models (bundled in resources)
  opennlp:
    models-path: classpath:opennlp/
    english-model: en-sent.bin
    spanish-model: es-sent.bin

  # Chunking expansion ratios (source-target -> ratio)
  chunking:
    expansion-ratios:
      en-es: 1.30
      en-pt: 1.25
      en-fr: 1.15
      en-it: 1.10
      en-de: 1.20
      en-nl: 1.15
      en-pl: 1.20
      en-ru: 1.15
      en-ar: 1.15
      en-zh: 0.55
      en-ja: 0.60
      en-ko: 0.65
      en-hi: 1.10
      es-en: 0.80
      fr-en: 0.85
      de-en: 0.85
      zh-en: 1.80
      ja-en: 1.70
      ko-en: 1.60
      ru-en: 0.90
      ar-en: 0.90

# Security (JWT Resource Server)
security:
  jwt:
    secret: ${JWT_SECRET:bllRbxCOXTiYhFGAapfUb4ob3bglSuz7QJ8xUpmTV9M=}
```

### 3.3 Configuration Properties Classes

```java
// LlmProperties.java - Root configuration
@ConfigurationProperties(prefix = "llm")
@Data
public class LlmProperties {
    private GeneralProperties general = new GeneralProperties();
    private NvidiaProperties nvidia = new NvidiaProperties();
    private OllamaProperties ollama = new OllamaProperties();
    private OpenNlpProperties opennlp = new OpenNlpProperties();
    private ChunkingProperties chunking = new ChunkingProperties();
}

// GeneralProperties.java
@Data
public class GeneralProperties {
    private String serviceName = "llm-service";
    private String serviceVersion = "0.1.0";
    private String logLevel = "INFO";
    private LlmProvider defaultProvider = LlmProvider.NVIDIA;
    private String tokenizerCacheDir = "./data/tokenizers";
}

// NvidiaProperties.java
@Data
public class NvidiaProperties {
    private String modelName = "mistralai/mistral-large-3-675b-instruct-2512";
    private double temperature = 0.2;
    private double topP = 0.95;
    private int maxOutputTokens = 8192;
    private int rateLimit = 30;
    private int retryAttempts = 6;
    private int requestTimeout = 3600;
    private int maxBucketSize = 10;
    private int contextSize = 131072;
    private double chunkSafetyMarginPct = 0.15;
    private int maxChunkTokens = 32768;
    private int minChunkTokens = 512;
    private String localTokenizerName = "mistralai/Mistral-Large-3-675B-Instruct-2512";
    private String localTokenizerDir = "mistral-large-3-675b-instruct-2512";
    private String baseUrl = "https://integrate.api.nvidia.com/v1";
    private String apiKey;
}

// OllamaProperties.java
@Data
public class OllamaProperties {
    private String modelName = "llama3.2";
    private double temperature = 0.3;
    private double topP = 0.9;
    private int contextSize = 4096;
    private boolean validateModel = true;
    private String localTokenizerName = "meta-llama/Llama-3.2-1B";
    private String localTokenizerDir = ".tokenizers/ollama";
    private String modelId = "meta-llama/Llama-3.1-8B-Instruct";
    private String baseUrl = "http://localhost:11434";
}

// OpenNlpProperties.java
@Data
public class OpenNlpProperties {
    private String modelsPath = "classpath:opennlp/";
    private String englishModel = "en-sent.bin";
    private String spanishModel = "es-sent.bin";
}

// ChunkingProperties.java
@Data
public class ChunkingProperties {
    private Map<String, Double> expansionRatios = new LinkedHashMap<>();
}

// LlmProvider.java
public enum LlmProvider {
    NVIDIA,
    OLLAMA
}
```

---

## 4. Security Design

### 4.1 Authentication Model: JWT Resource Server

The `llm-service` acts as an **OAuth2 Resource Server** that validates JWT tokens issued by the `security-module`.

### 4.2 SecurityConfig.java

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${security.jwt.secret:bllRbxCOXTiYhFGAapfUb4ob3bglSuz7QJ8xUpmTV9M=}")
    private String jwtSecret;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            )
            .build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecret)))
            .macAlgorithm(MacAlgorithm.HS256)
            .build();
    }
}
```

---

## 5. Core Protocol (Port Interfaces)

### 5.1 LlmClient.java (Primary Port)

```java
public interface LlmClient {

    /**
     * Call the LLM model with a prompt.
     *
     * @param prompt The prompt to send to the model
     * @return The model's response as a string
     */
    String callModel(String prompt);

    /**
     * Get the name of the currently active model.
     */
    String getCurrentModelName();

    /**
     * Get the provider type.
     */
    LlmProvider getProvider();
}
```

### 5.2 TokenCounter.java (Port)

```java
public interface TokenCounter {

    /**
     * Count the number of tokens in a text using the model's tokenizer.
     *
     * @param text The text to count tokens for
     * @return Number of tokens
     */
    int countTokens(String text);
}
```

### 5.3 TextSplitter.java (Port)

```java
public interface TextSplitter {

    /**
     * Split text into chunks that fit within token limits.
     *
     * @param text The text to split
     * @param maxTokens Maximum tokens per chunk
     * @param language Language for sentence detection (en/es)
     * @return List of text chunks
     */
    List<String> splitIntoChunks(String text, int maxTokens, String language);
}
```

---

## 6. Provider Adapters

### 6.1 NvidiaLlmAdapter.java

```java
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "llm.general.default-provider", havingValue = "NVIDIA", matchIfMissing = true)
public class NvidiaLlmAdapter implements LlmClient, TokenCounter {

    private final ChatModel chatModel;
    private final TokenCounter tokenCounter;
    private final NvidiaProperties properties;

    @Override
    public String callModel(String prompt) {
        Prompt promptObj = new Prompt(prompt);
        ChatResponse response = chatModel.call(promptObj);
        return response.getResult().getOutput().getText();
    }

    @Override
    public String getCurrentModelName() {
        return properties.getModelName();
    }

    @Override
    public LlmProvider getProvider() {
        return LlmProvider.NVIDIA;
    }

    @Override
    public int countTokens(String text) {
        return tokenCounter.countTokens(text);
    }
}
```

### 6.2 OllamaLlmAdapter.java

```java
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "llm.general.default-provider", havingValue = "OLLAMA")
public class OllamaLlmAdapter implements LlmClient, TokenCounter {

    private final ChatModel chatModel;
    private final TokenCounter tokenCounter;
    private final OllamaProperties properties;

    @Override
    public String callModel(String prompt) {
        Prompt promptObj = new Prompt(prompt);
        ChatResponse response = chatModel.call(promptObj);
        return response.getResult().getOutput().getText();
    }

    @Override
    public String getCurrentModelName() {
        return properties.getModelName();
    }

    @Override
    public LlmProvider getProvider() {
        return LlmProvider.OLLAMA;
    }

    @Override
    public int countTokens(String text) {
        return tokenCounter.countTokens(text);
    }
}
```

### 6.3 DjiTokenizerAdapter.java (DJL HuggingFaceTokenizer)

```java
@Service
@RequiredArgsConstructor
public class DjiTokenizerAdapter implements TokenCounter {

    private final HuggingFaceTokenizer tokenizer;

    @Override
    public int countTokens(String text) {
        if (tokenizer == null) {
            return text.length() / 4; // Rough fallback
        }
        Encoding encoding = tokenizer.encode(text);
        return encoding.getIds().length;
    }
}
```

### 6.4 TokenizerConfig.java (DJL Bean Configuration)

```java
@Configuration
@RequiredArgsConstructor
public class TokenizerConfig {

    private final LlmProperties properties;

    @Bean
    @ConditionalOnProperty(name = "llm.general.default-provider", havingValue = "NVIDIA", matchIfMissing = true)
    public HuggingFaceTokenizer nvidiaTokenizer() throws IOException {
        return loadOrDownloadTokenizer(
            properties.getNvidia().getLocalTokenizerName(),
            properties.getNvidia().getLocalTokenizerDir(),
            properties.getGeneral().getTokenizerCacheDir()
        );
    }

    @Bean
    @ConditionalOnProperty(name = "llm.general.default-provider", havingValue = "OLLAMA")
    public HuggingFaceTokenizer ollamaTokenizer() throws IOException {
        return loadOrDownloadTokenizer(
            properties.getOllama().getLocalTokenizerName(),
            properties.getOllama().getLocalTokenizerDir(),
            properties.getGeneral().getTokenizerCacheDir()
        );
    }

    private HuggingFaceTokenizer loadOrDownloadTokenizer(String modelName, String localDir, String cacheDir) throws IOException {
        Path tokenizerPath = Paths.get(cacheDir, localDir);
        
        if (Files.exists(tokenizerPath.resolve("tokenizer.json"))) {
            log.info("Loading cached tokenizer from {}", tokenizerPath);
            return HuggingFaceTokenizer.newInstance(tokenizerPath.toString());
        }

        try {
            log.info("Downloading tokenizer for {}...", modelName);
            HuggingFaceTokenizer tokenizer = HuggingFaceTokenizer.newInstance(modelName);
            tokenizerPath.toFile().mkdirs();
            tokenizer.save(tokenizerPath.toString());
            log.info("Tokenizer saved to {}", tokenizerPath);
            return tokenizer;
        } catch (Exception e) {
            log.warn("Failed to download tokenizer ({}). Using fallback gpt2.", e.getMessage());
            HuggingFaceTokenizer fallback = HuggingFaceTokenizer.newInstance("gpt2");
            fallbackPath = Paths.get(cacheDir, "gpt2-fallback");
            fallback.save(fallbackPath.toString());
            return fallback;
        }
    }
}
```

---

## 7. Text Splitting (OpenNLP)

### 7.1 OpenNlpTextSplitter.java

```java
@Service
@RequiredArgsConstructor
public class OpenNlpTextSplitter implements TextSplitter {

    private final SentenceDetectorME englishDetector;
    private final SentenceDetectorME spanishDetector;
    private final TokenCounter tokenCounter;

    @PostConstruct
    public void init() {
        // Models loaded from classpath via OpenNlpProperties
    }

    @Override
    public List<String> splitIntoChunks(String text, int maxTokens, String language) {
        SentenceDetectorME detector = "es".equalsIgnoreCase(language) ? spanishDetector : englishDetector;
        
        // Detect sentence boundaries
        Span[] sentences = detector.sentDetect(text);
        if (sentences.length == 0) {
            return List.of(text);
        }

        List<String> chunks = new ArrayList<>();
        StringBuilder currentChunk = new StringBuilder();
        int currentTokens = 0;

        for (Span sentence : sentences) {
            String sentenceText = text.substring(sentence.getStart(), sentence.getEnd()).trim();
            if (sentenceText.isEmpty()) continue;

            int sentenceTokens = tokenCounter.countTokens(sentenceText);

            // If single sentence exceeds limit, we must split it (fallback to token-based)
            if (sentenceTokens > maxTokens) {
                if (currentChunk.length() > 0) {
                    chunks.add(currentChunk.toString().trim());
                    currentChunk = new StringBuilder();
                    currentTokens = 0;
                }
                // Split long sentence by tokens
                chunks.addAll(splitLongSentence(sentenceText, maxTokens));
                continue;
            }

            // Check if adding this sentence exceeds limit
            if (currentTokens + sentenceTokens > maxTokens && currentChunk.length() > 0) {
                chunks.add(currentChunk.toString().trim());
                currentChunk = new StringBuilder();
                currentTokens = 0;
            }

            currentChunk.append(sentenceText).append(" ");
            currentTokens += sentenceTokens;
        }

        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString().trim());
        }

        return chunks;
    }

    private List<String> splitLongSentence(String text, int maxTokens) {
        // Fallback: simple token-based splitting for very long sentences
        List<String> result = new ArrayList<>();
        String[] words = text.split("\\s+");
        StringBuilder chunk = new StringBuilder();
        int tokens = 0;

        for (String word : words) {
            int wordTokens = tokenCounter.countTokens(word + " ");
            if (tokens + wordTokens > maxTokens && chunk.length() > 0) {
                result.add(chunk.toString().trim());
                chunk = new StringBuilder();
                tokens = 0;
            }
            chunk.append(word).append(" ");
            tokens += wordTokens;
        }

        if (chunk.length() > 0) {
            result.add(chunk.toString().trim());
        }

        return result;
    }
}
```

---

## 8. Adaptive Chunking (TokenChunkCalculator)

### 8.1 TokenChunkCalculator.java (Ported from Python)

```java
@Component
@RequiredArgsConstructor
public class TokenChunkCalculator {

    private static final String SAMPLE_TEXT = "Sample text for token measurement.";
    
    private final LlmClient llmClient;
    private final NvidiaProperties config;
    private final Map<String, Double> customRatios;

    // Default expansion ratios (source-target -> ratio)
    private static final Map<String, Double> DEFAULT_EXPANSION_RATIOS = Map.ofEntries(
        // English to romance languages (expansion)
        Map.entry("en-es", 1.30), Map.entry("en-pt", 1.25), Map.entry("en-fr", 1.15),
        Map.entry("en-it", 1.10),
        // English to germanic
        Map.entry("en-de", 1.20), Map.entry("en-nl", 1.15),
        // English to slavic
        Map.entry("en-pl", 1.20), Map.entry("en-ru", 1.15),
        // English to semitic
        Map.entry("en-ar", 1.15),
        // English to CJK (contraction)
        Map.entry("en-zh", 0.55), Map.entry("en-ja", 0.60), Map.entry("en-ko", 0.65),
        // English to indic
        Map.entry("en-hi", 1.10),
        // Reverse directions
        Map.entry("es-en", 0.80), Map.entry("fr-en", 0.85), Map.entry("de-en", 0.85),
        Map.entry("zh-en", 1.80), Map.entry("ja-en", 1.70), Map.entry("ko-en", 1.60),
        Map.entry("ru-en", 0.90), Map.entry("ar-en", 0.90)
    );

    public int measurePromptTokens(String template, String sourceLang, String targetLang) {
        String formatted = template
            .replace("{text_chunk}", SAMPLE_TEXT)
            .replace("{source_lang}", sourceLang)
            .replace("{target_lang}", targetLang);
        return llmClient.countTokens(formatted);
    }

    public double getExpansionRatio(String sourceLang, String targetLang) {
        String key = sourceLang.toLowerCase() + "-" + targetLang.toLowerCase();
        
        // Check custom overrides first
        if (customRatios != null && customRatios.containsKey(key)) {
            return customRatios.get(key);
        }
        
        // Check defaults
        if (DEFAULT_EXPANSION_RATIOS.containsKey(key)) {
            return DEFAULT_EXPANSION_RATIOS.get(key);
        }
        
        // Conservative fallback
        log.debug("No expansion ratio for {}->{}, using fallback 1.15", sourceLang, targetLang);
        return 1.15;
    }

    public int calculateChunkSize(int promptTokens, double expansionRatio) {
        double margin = 1.0 - config.getChunkSafetyMarginPct();

        // Limit 1: Output budget divided by expansion
        double byOutput = (config.getMaxOutputTokens() / expansionRatio) * margin;

        // Limit 2: Available context minus prompt and reserved output
        int availableContext = config.getContextSize() - promptTokens - config.getMaxOutputTokens();
        double byContext = Math.max(0, availableContext) * margin;

        // Apply bounds
        int chunkSize = (int) Math.min(Math.min(byOutput, byContext), config.getMaxChunkTokens());
        chunkSize = Math.max(chunkSize, config.getMinChunkTokens());

        log.info("Chunk calculation: prompt={}, expansion={:.2f}, byOutput={:.0f}, byContext={:.0f}, maxChunk={}, minChunk={} -> {}",
            promptTokens, expansionRatio, byOutput, byContext,
            config.getMaxChunkTokens(), config.getMinChunkTokens(), chunkSize);

        return chunkSize;
    }

    public boolean validateResponseNotTruncated(String response, int maxOutput) {
        int responseTokens = llmClient.countTokens(response);
        int threshold = (int) (maxOutput * 0.95);

        if (responseTokens > threshold) {
            log.warn("Possible truncation: response={} tokens > {} threshold (95% of maxOutput={})",
                responseTokens, threshold, maxOutput);
            return false;
        }
        return true;
    }
}
```

---

## 9. Factory Pattern

### 9.1 LlmFactory.java

```java
@Component
@RequiredArgsConstructor
public class LlmFactory {

    private final Map<LlmProvider, LlmClient> clients = new ConcurrentHashMap<>();
    private final Map<LlmProvider, TokenCounter> tokenCounters = new ConcurrentHashMap<>();
    private final Map<LlmProvider, TextSplitter> textSplitters = new ConcurrentHashMap<>();
    private final LlmProperties properties;
    private final NvidiaLlmAdapter nvidiaAdapter;
    private final OllamaLlmAdapter ollamaAdapter;
    private final DjiTokenizerAdapter tokenizerAdapter;
    private final OpenNlpTextSplitter textSplitter;

    public LlmClient createClient(LlmProvider provider) {
        return clients.computeIfAbsent(provider, p -> switch (p) {
            case NVIDIA -> nvidiaAdapter;
            case OLLAMA -> ollamaAdapter;
        });
    }

    public TokenCounter createTokenCounter(LlmProvider provider) {
        // TokenCounter is provider-agnostic (uses DJL tokenizer)
        return tokenCounters.computeIfAbsent(provider, p -> tokenizerAdapter);
    }

    public TextSplitter createTextSplitter(LlmProvider provider) {
        return textSplitters.computeIfAbsent(provider, p -> textSplitter);
    }

    public TokenChunkCalculator createChunkCalculator(LlmProvider provider) {
        LlmClient client = createClient(provider);
        TokenCounter counter = createTokenCounter(provider);
        return new TokenChunkCalculator(client, properties.getNvidia(), properties.getChunking().getExpansionRatios());
    }

    public LlmProvider getDefaultProvider() {
        return properties.getGeneral().getDefaultProvider();
    }
}
```

---

## 10. REST API

### 10.1 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/generate` | Generate text using LLM |
| POST | `/api/translate` | Translate text using LLM |
| GET | `/api/health` | Health check |
| GET | `/api/providers` | List available providers |

### 10.2 Request/Response DTOs

```java
// LlmRequest.java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LlmRequest {
    @NotBlank
    private String prompt;
    private LlmProvider provider;
    @DecimalMin("0.0") @DecimalMax("2.0")
    private Double temperature;
    @Min(1)
    private Integer maxTokens;
    private Map<String, Object> metadata;
}

// LlmResponse.java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LlmResponse {
    private String content;
    private String modelName;
    private LlmProvider provider;
    private Map<String, Integer> tokenUsage;
    private Map<String, Object> metadata;
}

// TranslateRequest.java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TranslateRequest {
    @NotBlank
    private String text;
    @NotBlank
    private String sourceLang;
    @NotBlank
    private String targetLang;
    private LlmProvider provider;
}

// TranslateResponse.java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TranslateResponse {
    private String translation;
}
```

### 10.3 Controllers

```java
// GenerateController.java
@RestController
@RequestMapping("/api/generate")
@RequiredArgsConstructor
@Tag(name = "Generate", description = "Text generation endpoints")
public class GenerateController {

    private final LlmFactory factory;

    @PostMapping
    @Operation(summary = "Generate text")
    public ResponseEntity<LlmResponse> generate(@Valid @RequestBody LlmRequest request) {
        LlmProvider provider = request.getProvider() != null ? request.getProvider() : factory.getDefaultProvider();
        LlmClient client = factory.createClient(provider);
        
        String response = client.callModel(request.getPrompt());
        
        return ResponseEntity.ok(LlmResponse.builder()
            .content(response)
            .modelName(client.getCurrentModelName())
            .provider(provider)
            .build());
    }
}

// TranslateController.java
@RestController
@RequestMapping("/api/translate")
@RequiredArgsConstructor
@Tag(name = "Translate", description = "Translation endpoints")
public class TranslateController {

    private final LlmFactory factory;

    @PostMapping
    @Operation(summary = "Translate text with adaptive chunking")
    public ResponseEntity<TranslateResponse> translate(@Valid @RequestBody TranslateRequest request) {
        LlmProvider provider = request.getProvider() != null ? request.getProvider() : factory.getDefaultProvider();
        LlmClient client = factory.createClient(provider);
        TokenCounter counter = factory.createTokenCounter(provider);
        TextSplitter splitter = factory.createTextSplitter(provider);
        TokenChunkCalculator calculator = factory.createChunkCalculator(provider);

        // Load prompt template
        String template = loadPromptTemplate();
        
        // Calculate adaptive chunk size
        int promptTokens = calculator.measurePromptTokens(template, request.getSourceLang(), request.getTargetLang());
        double expansionRatio = calculator.getExpansionRatio(request.getSourceLang(), request.getTargetLang());
        int chunkSize = calculator.calculateChunkSize(promptTokens, expansionRatio);

        log.info("Translation: chunkSize={} tokens, expansionRatio={:.2f}", chunkSize, expansionRatio);

        // Split text into chunks
        List<String> chunks = splitter.splitIntoChunks(request.getText(), chunkSize, request.getSourceLang());

        // Translate each chunk
        StringBuilder translation = new StringBuilder();
        for (String chunk : chunks) {
            String prompt = template
                .replace("{text_chunk}", chunk)
                .replace("{source_lang}", request.getSourceLang())
                .replace("{target_lang}", request.getTargetLang());
            
            String translated = client.callModel(prompt);
            translation.append(translated).append(" ");
        }

        return ResponseEntity.ok(TranslateResponse.builder()
            .translation(translation.toString().trim())
            .build());
    }

    private String loadPromptTemplate() {
        // Load from classpath or config
        return "Translate the following text from {source_lang} to {target_lang}:\n\n{text_chunk}\n\nTranslation:";
    }
}

// HealthController.java
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Tag(name = "Health", description = "Health check")
public class HealthController {
    @GetMapping
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "llm-service"));
    }
}

// ProviderController.java
@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
@Tag(name = "Providers", description = "Provider information")
public class ProviderController {

    private final LlmProperties properties;

    @GetMapping
    public ResponseEntity<Map<String, Object>> providers() {
        return ResponseEntity.ok(Map.of(
            "default", properties.getGeneral().getDefaultProvider().name(),
            "available", Arrays.stream(LlmProvider.values())
                .map(Enum::name)
                .toList()
        ));
    }
}
```

---

## 11. Integration Patterns

### 11.1 LlmServiceClient.java (High-level Client)

```java
@Component
@RequiredArgsConstructor
public class LlmServiceClient {

    private final LlmFactory factory;

    public String generate(String prompt) {
        return generate(prompt, null, null, null);
    }

    public String generate(String prompt, LlmProvider provider, Double temperature, Integer maxTokens) {
        LlmProvider p = provider != null ? provider : factory.getDefaultProvider();
        LlmClient client = factory.createClient(p);
        return client.callModel(prompt);
    }

    public String translate(String text, String sourceLang, String targetLang) {
        return translate(text, sourceLang, targetLang, null);
    }

    public String translate(String text, String sourceLang, String targetLang, LlmProvider provider) {
        LlmProvider p = provider != null ? provider : factory.getDefaultProvider();
        LlmClient client = factory.createClient(p);
        TokenCounter counter = factory.createTokenCounter(p);
        TextSplitter splitter = factory.createTextSplitter(p);
        TokenChunkCalculator calculator = factory.createChunkCalculator(p);

        String template = "Translate the following text from {source_lang} to {target_lang}:\n\n{text_chunk}\n\nTranslation:";
        
        int promptTokens = calculator.measurePromptTokens(template, sourceLang, targetLang);
        double expansionRatio = calculator.getExpansionRatio(sourceLang, targetLang);
        int chunkSize = calculator.calculateChunkSize(promptTokens, expansionRatio);

        List<String> chunks = splitter.splitIntoChunks(text, chunkSize, sourceLang);

        StringBuilder translation = new StringBuilder();
        for (String chunk : chunks) {
            String prompt = template
                .replace("{text_chunk}", chunk)
                .replace("{source_lang}", sourceLang)
                .replace("{target_lang}", targetLang);
            translation.append(client.callModel(prompt)).append(" ");
        }

        return translation.toString().trim();
    }
}
```

### 11.2 LlmIntegrationMixin.java (For Other Services)

```java
public class LlmIntegrationMixin {

    private LlmServiceClient llmClient;

    public void setLlmClient(LmServiceClient client) {
        this.llmClient = client;
    }

    protected LlmServiceClient getLlmClient() {
        if (llmClient == null) {
            throw new IllegalStateException("LLM client not configured");
        }
        return llmClient;
    }

    public String llmGenerate(String prompt) {
        return getLlmClient().generate(prompt);
    }

    public String llmTranslate(String text, String sourceLang, String targetLang) {
        return getLlmClient().translate(text, sourceLang, targetLang);
    }
}
```

---

## 12. API Documentation (Swagger/OpenAPI 3)

### 12.1 SwaggerConfig.java

```java
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "LLM Service API",
        version = "1.0.0",
        description = "Multi-provider LLM service (NVIDIA NIM, Ollama) with adaptive chunking for translation",
        contact = @Contact(name = "Backend Portfolio", url = "https://github.com/david-eve-za"),
        license = @License(name = "MIT", url = "https://opensource.org/licenses/MIT")
    ),
    servers = {
        @Server(url = "http://localhost:8080/llm-service", description = "Via API Gateway"),
        @Server(url = "http://localhost:8083", description = "Direct access")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT token from security-module"
)
public class SwaggerConfig {
}
```

### 12.2 Access Points

| URL | Description |
|-----|-------------|
| `http://localhost:8083/swagger-ui.html` | Swagger UI (direct) |
| `http://localhost:8080/llm-service/swagger-ui.html` | Swagger UI (via Gateway) |
| `http://localhost:8083/v3/api-docs` | OpenAPI JSON (direct) |
| `http://localhost:8080/llm-service/v3/api-docs` | OpenAPI JSON (via Gateway) |

---

## 13. Integration Points

### 13.1 Eureka Registration
- Service ID: `llm-service`
- Registers on startup, heartbeats every 10s

### 13.2 Config Server Discovery
- Bootstrap config locates Config Server via Eureka (`service-id: configserver`)

### 13.3 API Gateway Routing
- Gateway has `spring.cloud.gateway.discovery.locator.enabled: true`
- Automatic route: `/llm-service/**` → `llm-service` service ID

### 13.4 Security Module Integration
- Validates JWT using shared secret
- Token issued by security-module `/auth/authenticate` endpoint

### 13.5 External Dependencies
- **Ollama**: Must be running locally on `http://localhost:11434` with model pulled (`ollama pull llama3.2`)
- **NVIDIA NIM**: Requires API key and internet access to `https://integrate.api.nvidia.com`

---

## 14. Observability

### 14.1 Actuator Endpoints
- `/actuator/health`, `/actuator/info`, `/actuator/metrics`, `/actuator/prometheus`

### 14.2 Distributed Tracing
- Brave → Zipkin (port 9411)
- Sampling: 100% (dev)

### 14.3 Logging
- Structured JSON logging
- Log levels configurable via `llm.general.log-level`

---

## 15. Testing Strategy

- **Unit**: JUnit 5, Mockito, MockMvc
- **Integration**: Spring Boot Test, Testcontainers (for Ollama if needed)
- **Test profiles**: `application-test.yml`
- **Token counting tests**: Verify DJL tokenizer accuracy
- **Chunking tests**: Verify adaptive chunk sizes match Python implementation
- **OpenNLP tests**: Verify sentence splitting for EN/ES

---

## 16. Build & Deployment

### 16.1 Maven Module Integration

Added to parent `pom.xml`:
```xml
<module>llm-service</module>
```

### 16.2 Key Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- Spring Cloud -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
    </dependency>

    <!-- Spring AI -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-openai</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-ollama</artifactId>
    </dependency>

    <!-- DJL Tokenizers -->
    <dependency>
        <groupId>ai.djl.huggingface</groupId>
        <artifactId>tokenizers</artifactId>
        <version>0.36.0</version>
    </dependency>

    <!-- Apache OpenNLP -->
    <dependency>
        <groupId>org.apache.opennlp</groupId>
        <artifactId>opennlp-tools</artifactId>
        <version>3.0.0</version>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>com.nimbusds</groupId>
        <artifactId>nimbus-jose-jwt</artifactId>
    </dependency>

    <!-- OpenAPI/Swagger -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.6.0</version>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <scope>provided</scope>
    </dependency>

    <!-- Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 17. Future Extensibility

- Adding new providers: Create new adapter implementing `LlmClient` + `TokenCounter`
- Embeddings: Add `EmbeddingClient` port + adapters
- Vector stores: Spring AI VectorStore integration
- Streaming: Add `Flux<String> streamModel(String prompt)` to `LlmClient`
- Function calling: Add `FunctionCallingClient` port
- Multi-modal: Add `MultiModalClient` port for vision models

---

## 18. Acceptance Criteria

### 18.1 Functional
- [ ] Module builds: `./mvnw -pl llm-service clean install`
- [ ] Service starts on port 8083 and registers with Eureka
- [ ] Config Server loads configuration via discovery
- [ ] Swagger UI accessible at `http://localhost:8083/swagger-ui.html`
- [ ] POST `/api/generate` works with valid JWT
- [ ] POST `/api/translate` works with adaptive chunking
- [ ] GET `/api/health` returns 200 OK
- [ ] GET `/api/providers` returns provider list
- [ ] JWT validation works (401 without token, 200 with valid token)
- [ ] Actuator endpoints exposed and returning data
- [ ] Distributed traces appear in Zipkin
- [ ] DJL tokenizer loads (downloads on first run, caches)
- [ ] OpenNLP models load from classpath (en-sent.bin, es-sent.bin)

### 18.2 Non-Functional
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] Startup time < 20 seconds (includes tokenizer download on first run)
- [ ] Memory footprint < 512MB heap
- [ ] Token counting accuracy matches Python transformers within 5%

---

## 19. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| DJL tokenizer download fails | Fallback to gpt2 tokenizer; cache locally |
| OpenNLP models not found | Bundle in resources; verify at startup |
| NVIDIA API key missing | Validate at startup; clear error message |
| Ollama not running | Health check fails gracefully; clear error |
| Spring AI version conflicts | Use Spring Cloud BOM managed versions |
| Token counting mismatch | Unit test against known token counts |

---

## 20. Appendix: File Checklist

### New Files to Create

| Path | Purpose |
|------|---------|
| `llm-service/pom.xml` | Maven build config |
| `llm-service/src/main/java/gon/cue/llm/LlmServiceApplication.java` | Main class |
| `llm-service/src/main/java/gon/cue/llm/config/DataSourceConfig.java` | Datasource (future) |
| `llm-service/src/main/java/gon/cue/llm/config/JpaConfig.java` | JPA (future) |
| `llm-service/src/main/java/gon/cue/llm/config/SecurityConfig.java` | JWT Resource Server |
| `llm-service/src/main/java/gon/cue/llm/config/SwaggerConfig.java` | OpenAPI 3 config |
| `llm-service/src/main/java/gon/cue/llm/config/WebConfig.java` | CORS, WebMvc config |
| `llm-service/src/main/java/gon/cue/llm/config/LlmProperties.java` | Root config properties |
| `llm-service/src/main/java/gon/cue/llm/config/NvidiaConfig.java` | NVIDIA config |
| `llm-service/src/main/java/gon/cue/llm/config/OllamaConfig.java` | Ollama config |
| `llm-service/src/main/java/gon/cue/llm/config/TokenizerConfig.java` | DJL tokenizer beans |
| `llm-service/src/main/java/gon/cue/llm/controller/GenerateController.java` | POST /generate |
| `llm-service/src/main/java/gon/cue/llm/controller/TranslateController.java` | POST /translate |
| `llm-service/src/main/java/gon/cue/llm/controller/HealthController.java` | GET /health |
| `llm-service/src/main/java/gon/cue/llm/controller/ProviderController.java` | GET /providers |
| `llm-service/src/main/java/gon/cue/llm/model/LlmRequest.java` | Generate request DTO |
| `llm-service/src/main/java/gon/cue/llm/model/LlmResponse.java` | Generate response DTO |
| `llm-service/src/main/java/gon/cue/llm/model/TranslateRequest.java` | Translate request DTO |
| `llm-service/src/main/java/gon/cue/llm/model/TranslateResponse.java` | Translate response DTO |
| `llm-service/src/main/java/gon/cue/llm/service/port/LlmClient.java` | LLM client port |
| `llm-service/src/main/java/gon/cue/llm/service/port/TokenCounter.java` | Token counter port |
| `llm-service/src/main/java/gon/cue/llm/service/port/TextSplitter.java` | Text splitter port |
| `llm-service/src/main/java/gon/cue/llm/service/adapter/NvidiaLlmAdapter.java` | NVIDIA adapter |
| `llm-service/src/main/java/gon/cue/llm/service/adapter/OllamaLlmAdapter.java` | Ollama adapter |
| `llm-service/src/main/java/gon/cue/llm/service/adapter/DjiTokenizerAdapter.java` | DJL tokenizer |
| `llm-service/src/main/java/gon/cue/llm/service/adapter/OpenNlpTextSplitter.java` | OpenNLP splitter |
| `llm-service/src/main/java/gon/cue/llm/factory/LlmFactory.java` | Provider factory |
| `llm-service/src/main/java/gon/cue/llm/chunking/TokenChunkCalculator.java` | Adaptive chunking |
| `llm-service/src/main/java/gon/cue/llm/chunking/ExpansionRatios.java` | Language ratios |
| `llm-service/src/main/java/gon/cue/llm/integration/LlmServiceClient.java` | High-level client |
| `llm-service/src/main/java/gon/cue/llm/integration/LlmIntegrationMixin.java` | Service mixin |
| `llm-service/src/main/resources/application.yml` | Main configuration |
| `llm-service/src/main/resources/bootstrap.yml` | Bootstrap configuration |
| `llm-service/src/main/resources/opennlp/en-sent.bin` | English sentence model |
| `llm-service/src/main/resources/opennlp/es-sent.bin` | Spanish sentence model |
| `llm-service/src/test/java/gon/cue/llm/LlmServiceApplicationTests.java` | Context load test |
| `llm-service/src/test/java/gon/cue/llm/adapter/NvidiaLlmAdapterTest.java` | NVIDIA adapter tests |
| `llm-service/src/test/java/gon/cue/llm/adapter/OllamaLlmAdapterTest.java` | Ollama adapter tests |
| `llm-service/src/test/java/gon/cue/llm/adapter/DjiTokenizerAdapterTest.java` | Tokenizer tests |
| `llm-service/src/test/java/gon/cue/llm/adapter/OpenNlpTextSplitterTest.java` | Splitter tests |
| `llm-service/src/test/java/gon/cue/llm/chunking/TokenChunkCalculatorTest.java` | Chunking tests |
| `llm-service/src/test/java/gon/cue/llm/controller/GenerateControllerTest.java` | Generate API tests |
| `llm-service/src/test/java/gon/cue/llm/controller/TranslateControllerTest.java` | Translate API tests |

### Modified Files

| Path | Change |
|------|--------|
| `pom.xml` (root) | Add `<module>llm-service</module>` |

---

**Document Version:** 1.0
**Next Step:** Invoke `writing-plans` skill to create implementation plan