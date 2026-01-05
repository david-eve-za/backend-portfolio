package gon.cue.security.controller;

import gon.cue.security.model.AuthRequest;
import gon.cue.security.model.AuthResponse;
import gon.cue.security.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

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
        when(jwtUtil.generateToken("testuser")).thenReturn(expectedToken);

        AuthResponse authResponse = authController.authenticateAndGetToken(authRequest);
        assertEquals(expectedToken, authResponse.getToken());
    }

    @Test
    void authenticateAndGetToken_failure() {
        AuthRequest authRequest = new AuthRequest("wronguser", "wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        assertThrows(BadCredentialsException.class, () -> authController.authenticateAndGetToken(authRequest));
    }

    @Test
    void userProfile() {
        assertEquals("Welcome, authenticated user!", authController.userProfile());
    }
}
