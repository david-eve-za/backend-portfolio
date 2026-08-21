package gon.cue.llmservice.controller;

import gon.cue.llmservice.model.dto.GenerateRequest;
import gon.cue.llmservice.model.dto.GenerateResponse;
import gon.cue.llmservice.model.enums.LLMProvider;
import gon.cue.llmservice.service.LLMProviderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GenerateController.class)
@WithMockUser
class GenerateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LLMProviderService llmProviderService;

    @Test
    void shouldGenerateText() throws Exception {
        GenerateResponse response = new GenerateResponse();
        response.setContent("Generated text");
        response.setModelName("meta/llama-3.1-70b-instruct");
        response.setProvider(LLMProvider.NVIDIA);

        when(llmProviderService.generate(any(GenerateRequest.class)))
            .thenReturn(response);

        mockMvc.perform(post("/api/llm/generate")
                .with(SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"prompt\":\"Test prompt\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").value("Generated text"))
            .andExpect(jsonPath("$.provider").value("NVIDIA"));
    }
}