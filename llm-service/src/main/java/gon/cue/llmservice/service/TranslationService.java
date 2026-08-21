package gon.cue.llmservice.service;

import gon.cue.llmservice.model.dto.GenerateResponse;
import gon.cue.llmservice.model.dto.TranslateRequest;
import gon.cue.llmservice.model.dto.TranslateResponse;
import gon.cue.llmservice.model.enums.LLMProvider;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TranslationService {

    private final LLMProviderService llmProviderService;

    public TranslationService(LLMProviderService llmProviderService) {
        this.llmProviderService = llmProviderService;
    }

    public TranslateResponse translate(TranslateRequest request) {
        GenerateResponse response = llmProviderService.translate(request);
        TranslateResponse result = new TranslateResponse();
        result.setTranslation(response.getContent());
        return result;
    }

    public List<TranslateResponse> translateChapters(List<String> chapters, 
                                                      String sourceLang, 
                                                      String targetLang, 
                                                      LLMProvider provider) {
        return chapters.stream()
            .map(chapter -> {
                TranslateRequest req = new TranslateRequest();
                req.setText(chapter);
                req.setSourceLang(sourceLang);
                req.setTargetLang(targetLang);
                req.setProvider(provider);
                return translate(req);
            })
            .toList();
    }
}