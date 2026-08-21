package gon.cue.llmservice.advisor;

import gon.cue.llmservice.service.TokenChunkCalculator;
import gon.cue.llmservice.service.tokenizer.DJLTokenizer;
import gon.cue.llmservice.service.tokenizer.TokenizerRegistry;
import gon.cue.llmservice.model.enums.LLMProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AdaptiveChunkingAdvisorTest {

    @Mock
    private TokenChunkCalculator chunkCalculator;

    @Mock
    private TokenizerRegistry tokenizerRegistry;

    @Mock
    private DJLTokenizer tokenizer;

    private AdaptiveChunkingAdvisor advisor;

    @Test
    void shouldHaveCorrectOrder() {
        advisor = new AdaptiveChunkingAdvisor(chunkCalculator, tokenizerRegistry);
        assertEquals(20, advisor.getOrder());
    }

    @Test
    void shouldHaveCorrectName() {
        advisor = new AdaptiveChunkingAdvisor(chunkCalculator, tokenizerRegistry);
        assertEquals("adaptiveChunkingAdvisor", advisor.getName());
    }
}