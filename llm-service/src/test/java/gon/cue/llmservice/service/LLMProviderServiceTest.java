package gon.cue.llmservice.service;

import java.util.List;

import gon.cue.llmservice.model.dto.GenerateRequest;
import gon.cue.llmservice.model.dto.GenerateResponse;
import gon.cue.llmservice.model.dto.TranslateRequest;
import gon.cue.llmservice.model.enums.LLMProvider;
import gon.cue.llmservice.service.tokenizer.DJLTokenizer;
import gon.cue.llmservice.service.tokenizer.TokenizerRegistry;
import gon.cue.llmservice.service.tokenizer.TokenizerType;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
public class LLMProviderServiceTest {

  @Mock
  private ProviderFactory providerFactory;

  @Mock
  private TokenChunkCalculator chunkCalculator;

  @Mock
  private TokenizerRegistry tokenizerRegistry;

  @Mock
  private ChatModel nvidiaChatModel;

  @Mock
  private ChatModel ollamaChatModel;

  private LLMProviderService service;

  @BeforeEach
  void setUp() {
    service = new LLMProviderService(providerFactory, chunkCalculator, tokenizerRegistry);
  }

  @Test
  void shouldGenerateWithDefaultProvider() {
    GenerateRequest request = new GenerateRequest();
    request.setPrompt("Test prompt");

    when(providerFactory.getDefaultProvider()).thenReturn(LLMProvider.NVIDIA);
    when(providerFactory.getChatModel(LLMProvider.NVIDIA)).thenReturn(nvidiaChatModel);
    when(nvidiaChatModel.call(any(Prompt.class))).thenReturn(mockChatResponse("Test response"));

    GenerateResponse response = service.generate(request);

    Assertions.assertNotNull(response);
    Assertions.assertEquals("Test response", response.getContent());
    Assertions.assertEquals(LLMProvider.NVIDIA, response.getProvider());
  }

  @Test
  void shouldTranslateWithSpecificProvider() {
    TranslateRequest request = new TranslateRequest();
    request.setText("Hello world");
    request.setSourceLang("en");
    request.setTargetLang("es");
    request.setProvider(LLMProvider.NVIDIA);

    // Mock the adaptive translation flow
    when(providerFactory.getChatModel(LLMProvider.NVIDIA)).thenReturn(nvidiaChatModel);
    
    DJLTokenizer tokenizerMock = mock(DJLTokenizer.class);
    when(tokenizerRegistry.getTokenizer(eq("gpt2"), eq(TokenizerType.HUGGINGFACE))).thenReturn(tokenizerMock);
    when(tokenizerMock.countTokens(anyString())).thenReturn(10);
    when(chunkCalculator.calculateChunkSize(eq("en"), eq("es"), any(DJLTokenizer.class))).thenReturn(100);
    when(chunkCalculator.splitText(anyString(), anyInt(), any(DJLTokenizer.class))).thenReturn(List.of("Hola mundo"));
    when(nvidiaChatModel.call(any(Prompt.class))).thenReturn(mockChatResponse("Hola mundo"));

    GenerateResponse response = service.translate(request);

    Assertions.assertNotNull(response);
    Assertions.assertEquals("Hola mundo", response.getContent());
    Assertions.assertEquals(LLMProvider.NVIDIA, response.getProvider());
  }

  private ChatResponse mockChatResponse(String content) {
    AssistantMessage assistantMessage = new AssistantMessage(content);
    Generation generation = new Generation(assistantMessage);
    return new ChatResponse(List.of(generation));
  }
}