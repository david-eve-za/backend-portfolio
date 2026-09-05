package gon.cue.llmservice.config;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingOptions;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Custom embedding model for NVIDIA's API that properly handles the `input_type` parameter
 * required for asymmetric models like nv-embedqa-e5-v5.
 * 
 * The NVIDIA embedding API requires an `input_type` parameter for asymmetric models:
 * - "query" for search queries
 * - "passage" for document passages
 */
public class NvidiaCustomEmbeddingModel implements EmbeddingModel {

    private final RestClient restClient;
    private final String modelName;
    private final int dimensions;
    private final String inputType;

    public NvidiaCustomEmbeddingModel(String baseUrl, String apiKey, String modelName, int dimensions, String inputType) {
        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();
        this.modelName = modelName;
        this.dimensions = dimensions;
        this.inputType = inputType;
    }

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        List<String> texts = request.getInstructions();
        
        Map<String, Object> requestBody = Map.of(
            "input", texts,
            "model", modelName,
            "input_type", inputType,
            "dimensions", dimensions
        );
        
        Map<String, Object> response = restClient.post()
            .uri("/embeddings")
            .body(requestBody)
            .retrieve()
            .body(Map.class);
        
        // Parse the response
        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        
        // Spring AI 2.0 EmbeddingResponse constructor takes List<Embedding>
        // Embedding is a class with constructor: Embedding(float[] output, Integer index)
        List<Embedding> embeddings = data.stream().map(item -> {
            List<Number> embeddingNumbers = (List<Number>) item.get("embedding");
            float[] embedding = new float[embeddingNumbers.size()];
            for (int i = 0; i < embeddingNumbers.size(); i++) {
                embedding[i] = embeddingNumbers.get(i).floatValue();
            }
            Integer index = (Integer) item.get("index");
            
            return new Embedding(embedding, index);
        }).collect(Collectors.toList());
        
        return new EmbeddingResponse(embeddings);
    }

    @Override
    public float[] embed(Document document) {
        return call(new EmbeddingRequest(List.of(document.getText()), EmbeddingOptions.builder().build()))
            .getResults().get(0).getOutput();
    }

    @Override
    public int dimensions() {
        return dimensions;
    }
}