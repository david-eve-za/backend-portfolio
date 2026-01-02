package com.example.security.controller;

import com.example.security.model.AuthRequest;
import com.example.security.model.AuthResponse;
import com.example.security.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome to Security Module!";
    }

    @PostMapping("/authenticate")
    public AuthResponse authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
        // If authentication is successful, the method proceeds. Otherwise, an exception is thrown.
        String token = jwtUtil.generateToken(authRequest.getUsername());
        return new AuthResponse(token);
    }

    @GetMapping("/user/profile")
    public String userProfile() {
        return "Welcome, authenticated user!";
    }
}
