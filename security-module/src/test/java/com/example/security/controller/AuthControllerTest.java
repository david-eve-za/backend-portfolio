package com.example.security.controller;

import com.example.security.model.AuthRequest;
import com.example.security.service.UserDetailsServiceImpl;
import com.example.security.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class AuthControllerTest {

    @InjectMocks
    private AuthController authController;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsServiceImpl userDetailsService; // Although not directly used in AuthController for loading, mock it for completeness

    @Mock
    private Authentication authentication;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void welcome() {
        assertEquals("Welcome to Security Module!", authController.welcome());
    }

    @Test
    void authenticateAndGetToken_success() {
        AuthRequest authRequest = new AuthRequest("testuser", "password");
        String expectedToken = "mocked_jwt_token";

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(jwtUtil.generateToken("testuser")).thenReturn(expectedToken);

        String token = authController.authenticateAndGetToken(authRequest);
        assertEquals(expectedToken, token);
    }

    @Test
    void authenticateAndGetToken_failure() {
        AuthRequest authRequest = new AuthRequest("wronguser", "wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new UsernameNotFoundException("invalid user request !"));

        assertThrows(UsernameNotFoundException.class, () -> authController.authenticateAndGetToken(authRequest));
    }

    @Test
    void userProfile() {
        assertEquals("Welcome, authenticated user!", authController.userProfile());
    }
}
