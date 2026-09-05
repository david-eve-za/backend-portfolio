package gon.cue.llmservice.config;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingOptions;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.util.Assert;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

/**
 * Wrapper for NVIDIA's embedding model that adds the required `input_type` parameter
 * for asymmetric models like nv-embedqa-e5-v5.
 * 
 * The NVIDIA embedding API requires an `input_type` parameter for asymmetric models:
 * - "query" for search queries
 * - "passage" for document passages
 */
public class NvidiaEmbeddingModelWrapper implements EmbeddingModel {

    private final EmbeddingModel delegate;
    private final String inputType;

    public NvidiaEmbeddingModelWrapper(EmbeddingModel delegate, String inputType) {
        this.delegate = delegate;
        this.inputType = inputType;
    }

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        // Add input_type to the request options via reflection
        try {
            var optionsField = EmbeddingRequest.class.getDeclaredField("options");
            optionsField.setAccessible(true);
            var options = optionsField.get(request);
            
            var customOptionsField = options.getClass().getDeclaredField("customOptions");
            customOptionsField.setAccessible(true);
            customOptionsField.set(options, Map.of("input_type", inputType));
        } catch (Exception e) {
            // If reflection fails, the delegate will handle the request without input_type
        }
        
        return delegate.call(request);
    }

    @Override
    public float[] embed(Document document) {
        // Create a request with the document content and embed
        EmbeddingRequest request = new EmbeddingRequest(
            List.of(document.getText()),
            org.springframework.ai.embedding.EmbeddingOptions.builder().build()
        );
        
        // Add input_type via reflection
        try {
            var optionsField = EmbeddingRequest.class.getDeclaredField("options");
            optionsField.setAccessible(true);
            var options = optionsField.get(request);
            
            var customOptionsField = options.getClass().getDeclaredField("customOptions");
            customOptionsField.setAccessible(true);
            customOptionsField.set(options, Map.of("input_type", inputType));
        } catch (Exception e) {
            // Ignore reflection errors
        }
        
        EmbeddingResponse response = delegate.call(request);
        if (response.getResults() != null && !response.getResults().isEmpty()) {
            return response.getResults().get(0).getOutput();
        }
        return new float[0];
    }

    @Override
    public int dimensions() {
        return delegate.dimensions();
    }
}