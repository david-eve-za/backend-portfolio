package gon.cue.security.service.port;

import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String generateToken(String username);
    boolean validateToken(String token, UserDetails userDetails);
    String extractUsername(String token);
    boolean isTokenExpired(String token);
}
