package com.example.security.controller;

import com.example.security.model.AuthRequest;
import com.example.security.service.UserDetailsServiceImpl;
import com.example.security.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling authentication requests.
 * Provides endpoints for user authentication and JWT token generation.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    /**
     * Welcome endpoint for unauthenticated access.
     * @return A welcome message.
     */
    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome to Security Module!";
    }

    /**
     * Authenticates a user and generates a JWT token.
     * @param authRequest The authentication request containing username and password.
     * @return A JWT token if authentication is successful.
     * @throws UsernameNotFoundException if authentication fails.
     */
    @PostMapping("/authenticate")
    public String authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
        if (authentication.isAuthenticated()) {
            return jwtUtil.generateToken(authRequest.getUsername());
        } else {
            throw new UsernameNotFoundException("invalid user request !");
        }
    }

    /**
     * Protected endpoint for authenticated users.
     * @return A message indicating successful authentication.
     */
    @GetMapping("/user/profile")
    public String userProfile() {
        return "Welcome, authenticated user!";
    }
}
