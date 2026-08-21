package gon.cue.llmservice.config;

import com.google.genai.Client;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.OpenAiEmbeddingOptions;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class SpringAiConfig {

    @Bean
    @Primary
    @Qualifier("nvidiaChatModel")
    public ChatModel nvidiaChatModel(ProviderConfig config) {
        ProviderConfig.NvidiaConfig nvidia = config.nvidia();
        OpenAiApi api = OpenAiApi.builder()
            .baseUrl("https://integrate.api.nvidia.com")
            .apiKey(System.getenv("NVIDIA_API_KEY"))
            .build();
        return OpenAiChatModel.builder()
            .openAiApi(api)
            .defaultOptions(OpenAiChatOptions.builder()
                .model(nvidia.modelName())
                .temperature(nvidia.temperature())
                .topP(nvidia.topP())
                .maxTokens(nvidia.maxOutputTokens())
                .build())
            .build();
    }

    @Bean
    @Qualifier("geminiChatModel")
    public ChatModel geminiChatModel(ProviderConfig config) {
        ProviderConfig.GeminiConfig gemini = config.gemini();
        Client client = Client.builder()
            .apiKey(System.getenv("GOOGLE_API_KEY"))
            .build();
        return GoogleGenAiChatModel.builder()
            .genAiClient(client)
            .defaultOptions(GoogleGenAiChatOptions.builder()
                .model(gemini.modelNames().get(0))
                .temperature(gemini.temperature())
                .topP(gemini.topP())
                .topK(gemini.topK())
                .build())
            .build();
    }

    @Bean
    @Qualifier("ollamaChatModel")
    public ChatModel ollamaChatModel(ProviderConfig config) {
        ProviderConfig.OllamaConfig ollama = config.ollama();
        OllamaApi api = OllamaApi.builder()
            .baseUrl("http://localhost:11434")
            .build();
        return OllamaChatModel.builder()
            .ollamaApi(api)
            .defaultOptions(OllamaChatOptions.builder()
                .model(ollama.modelName())
                .temperature(ollama.temperature())
                .topP(ollama.topP())
                .build())
            .build();
    }

    @Bean
    @Primary
    @Qualifier("nvidiaEmbeddingModel")
    public EmbeddingModel nvidiaEmbeddingModel(ProviderConfig config) {
        ProviderConfig.EmbeddingConfig emb = config.embedding();
        OpenAiApi api = OpenAiApi.builder()
            .baseUrl("https://integrate.api.nvidia.com")
            .apiKey(System.getenv("NVIDIA_API_KEY"))
            .build();
        return new OpenAiEmbeddingModel(
            api,
            org.springframework.ai.document.MetadataMode.EMBED,
            OpenAiEmbeddingOptions.builder()
                .model(emb.modelName())
                .dimensions(emb.dimensions())
                .build()
        );
    }

    @Bean
    @Qualifier("nvidiaRerankModel")
    public EmbeddingModel nvidiaRerankModel(ProviderConfig config) {
        // NVIDIA rerank uses different endpoint - placeholder for now
        return nvidiaEmbeddingModel(config);
    }
}