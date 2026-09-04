package gon.cue.security.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import gon.cue.security.dto.UpdateUserDto;
import gon.cue.security.dto.UserDto;
import gon.cue.security.mapper.UserMapper;
import gon.cue.security.model.User;
import gon.cue.security.service.port.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.cloud.config.enabled=false",
    "security.rate-limit.capacity=1000",
    "security.rate-limit.refill-tokens=1000",
    "security.rate-limit.refill-duration=1s"
})
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserMapper userMapper;

    private User testUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        testUser = new User(1L, "testuser", "password", new HashSet<>());
        adminUser = new User(2L, "adminuser", "adminpassword", new HashSet<>());
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userService.findByUsername("adminuser")).thenReturn(Optional.of(adminUser));
        when(userMapper.toDto(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            return new UserDto(u.getId(), u.getUsername());
        });
        when(userMapper.toDtoList(any(List.class))).thenAnswer(invocation -> {
            List<User> users = invocation.getArgument(0);
            return users.stream().map(u -> new UserDto(u.getId(), u.getUsername())).toList();
        });
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
        User updatedUser = new User(1L, "newusername", "password", new HashSet<>());
        when(userService.save(any(User.class))).thenReturn(updatedUser);
        when(userMapper.toDto(any(User.class))).thenReturn(new UserDto(1L, "newusername"));

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
