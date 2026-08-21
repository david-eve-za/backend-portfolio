package gon.cue.llmservice.model.dto;

import lombok.Data;
import java.util.List;

@Data
public class RerankResponse {
    private List<RerankResult> results;
    
    @Data
    public static class RerankResult {
        private int index;
        private double relevanceScore;
        private String document;
    }
}