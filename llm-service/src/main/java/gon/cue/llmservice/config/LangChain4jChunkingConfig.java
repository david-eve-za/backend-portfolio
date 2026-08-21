package gon.cue.llmservice.config;

import dev.langchain4j.data.document.splitter.DocumentBySentenceSplitter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LangChain4jChunkingConfig {

    @Bean
    public DocumentBySentenceSplitter documentSplitter() {
        return new DocumentBySentenceSplitter(2000, 200);
    }
}