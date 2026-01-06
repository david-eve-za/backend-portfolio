package gon.cue.security.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import gon.cue.security.dto.UpdateUserDto;
import gon.cue.security.model.User;
import gon.cue.security.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {"spring.cloud.config.enabled=false"})
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    private User testUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        testUser = new User(1L, "testuser", "password", new HashSet<>());
        adminUser = new User(2L, "adminuser", "adminpassword", new HashSet<>());
        // Mocking behavior for findByUsername as it's used by @AuthenticationPrincipal
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userService.findByUsername("adminuser")).thenReturn(Optional.of(adminUser));
    }

    @Test
    @WithMockUser(username = "testuser", roles = {"USER"})
    void getCurrentUserProfile_shouldReturnCurrentUser() throws Exception {
        mockMvc.perform(get("/api/users/me").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.username").value(testUser.getUsername()));
    }

    @Test
    @WithMockUser(username = "testuser", roles = {"USER"})
    void updateCurrentUserProfile_shouldUpdateAndReturnUser() throws Exception {
        UpdateUserDto updateDto = new UpdateUserDto("newusername");
        User updatedUser = new User(1L, "newusername", "password", new HashSet<>()); // password remains same
        when(userService.save(any(User.class))).thenReturn(updatedUser);

        mockMvc.perform(put("/api/users/me").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(updatedUser.getId()))
                .andExpect(jsonPath("$.username").value(updatedUser.getUsername()));
    }

    @Test
    @WithMockUser(username = "adminuser", roles = {"ADMIN"})
    void getUserProfileById_shouldReturnUser_forAdmin() throws Exception {
        when(userService.findById(1L)).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/api/users/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.username").value(testUser.getUsername()));
    }

    @Test
    @WithMockUser(username = "adminuser", roles = {"ADMIN"})
    void getAllUsers_shouldReturnAllUsers_forAdmin() throws Exception {
        when(userService.findAll()).thenReturn(Arrays.asList(testUser, adminUser));

        mockMvc.perform(get("/api/users").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testUser.getId()))
                .andExpect(jsonPath("$[1].id").value(adminUser.getId()))
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser(username = "adminuser", roles = {"ADMIN"})
    void deleteUserById_shouldReturnNoContent_forAdmin() throws Exception {
        mockMvc.perform(delete("/api/users/1").with(csrf()))
                .andExpect(status().isNoContent());
    }

    // Add tests for unauthorized access if roles are fully implemented
    @Test
    @WithMockUser(username = "testuser", roles = {"USER"})
    void getUserProfileById_shouldReturnForbidden_forNonAdmin() throws Exception {
        when(userService.findById(1L)).thenReturn(Optional.of(testUser)); // Mock existing user
        mockMvc.perform(get("/api/users/1").with(csrf()))
                .andExpect(status().isForbidden());
    }
}
