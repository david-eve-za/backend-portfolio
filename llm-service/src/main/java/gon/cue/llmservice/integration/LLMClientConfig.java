package gon.cue.llmservice.integration;

import gon.cue.llmservice.service.LLMProviderService;
import gon.cue.llmservice.service.TranslationService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class LLMClientConfig {

    @Bean
    public LLMServiceClient llmServiceClient(LLMProviderService llmProviderService,
                                              TranslationService translationService) {
        return LLMServiceClient.local(llmProviderService, translationService);
    }

    @Bean
    public RestClient restClient() {
        return RestClient.builder().build();
    }
}