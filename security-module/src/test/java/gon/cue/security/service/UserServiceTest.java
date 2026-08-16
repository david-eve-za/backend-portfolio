package gon.cue.security.service;

import gon.cue.security.model.User;
import gon.cue.security.repository.UserRepository;
import gon.cue.security.service.adapter.UserServiceImpl;
import gon.cue.security.service.port.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findById_shouldReturnUser_whenUserExists() {
        User user = new User(1L, "testuser", "password", new HashSet<>());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<User> foundUser = userService.findById(1L);
        assertTrue(foundUser.isPresent());
        assertEquals("testuser", foundUser.get().getUsername());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void findById_shouldReturnEmpty_whenUserDoesNotExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<User> foundUser = userService.findById(1L);
        assertFalse(foundUser.isPresent());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void findByUsername_shouldReturnUser_whenUserExists() {
        User user = new User(1L, "testuser", "password", new HashSet<>());
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        Optional<User> foundUser = userService.findByUsername("testuser");
        assertTrue(foundUser.isPresent());
        assertEquals("testuser", foundUser.get().getUsername());
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    void findByUsername_shouldReturnEmpty_whenUserDoesNotExist() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        Optional<User> foundUser = userService.findByUsername("testuser");
        assertFalse(foundUser.isPresent());
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    void findAll_shouldReturnAllUsers() {
        User user1 = new User(1L, "user1", "pass1", new HashSet<>());
        User user2 = new User(2L, "user2", "pass2", new HashSet<>());
        List<User> userList = Arrays.asList(user1, user2);
        when(userRepository.findAll()).thenReturn(userList);

        List<User> foundUsers = userService.findAll();
        assertEquals(2, foundUsers.size());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void save_shouldReturnSavedUser() {
        User userToSave = new User(null, "newuser", "newpass", new HashSet<>());
        User savedUser = new User(1L, "newuser", "newpass", new HashSet<>());
        when(userRepository.save(userToSave)).thenReturn(savedUser);

        User result = userService.save(userToSave);
        assertEquals(1L, result.getId());
        assertEquals("newuser", result.getUsername());
        verify(userRepository, times(1)).save(userToSave);
    }

    @Test
    void deleteById_shouldCallDelete() {
        doNothing().when(userRepository).deleteById(1L);

        userService.deleteById(1L);
        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    void updateUsername_shouldReturnUpdatedUser_whenUserExists() {
        User existingUser = new User(1L, "olduser", "oldpass", new HashSet<>());
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        User result = userService.updateUsername(1L, "newuser");
        assertEquals(1L, result.getId());
        assertEquals("newuser", result.getUsername());
        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).save(existingUser);
    }

    @Test
    void updateUsername_shouldThrowException_whenUserDoesNotExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userService.updateUsername(1L, "newuser"));
        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, never()).save(any(User.class));
    }
}