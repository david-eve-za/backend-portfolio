package gon.cue.llmservice.model.dto;

import lombok.Data;
import java.util.List;

@Data
public class EmbedResponse {
    private List<Embedding> data;
    private String model;
    private Usage usage;
    
    @Data
    public static class Embedding {
        private int index;
        private List<Float> embedding;
    }
    
    @Data
    public static class Usage {
        private int promptTokens;
        private int totalTokens;
    }
}