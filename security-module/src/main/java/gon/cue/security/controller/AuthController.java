package gon.cue.security.controller;

import gon.cue.security.model.AuthRequest;
import gon.cue.security.model.AuthResponse;
import gon.cue.security.service.port.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome to Security Module!";
    }

    @PostMapping("/authenticate")
    public AuthResponse authenticateAndGetToken(@RequestBody @Valid AuthRequest authRequest) {
        String token = jwtService.generateToken(authRequest.getUsername());
        return new AuthResponse(token);
    }

    @GetMapping("/user/profile")
    public String userProfile() {
        return "Welcome, authenticated user!";
    }
}
