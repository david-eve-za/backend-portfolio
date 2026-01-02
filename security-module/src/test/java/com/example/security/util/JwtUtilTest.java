package com.example.security.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilTest {

    @InjectMocks
    private JwtUtil jwtUtil;

    private String secretKey = "Neg4Z0GYLPWLsAx1FleNFuis0hfSsw1fucxxEHf30js=";

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(jwtUtil, "SECRET_KEY", secretKey);
    }

    private String createTestToken(String username, Date expirationDate) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(expirationDate)
                .signWith(getSignKey(), SignatureAlgorithm.HS256).compact();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Test
    void extractUsername() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);
        assertEquals(username, jwtUtil.extractUsername(token));
    }

    @Test
    void extractExpiration() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);
        assertNotNull(jwtUtil.extractExpiration(token));
        assertTrue(jwtUtil.extractExpiration(token).after(new Date()));
    }

    @Test
    void validateToken_validToken() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);
        UserDetails userDetails = new User(username, "password", Collections.emptyList());
        assertTrue(jwtUtil.validateToken(token, userDetails));
    }

    @Test
    void validateToken_invalidUsername() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);
        UserDetails userDetails = new User("wronguser", "password", Collections.emptyList());
        assertFalse(jwtUtil.validateToken(token, userDetails));
    }

    @Test
    void validateToken_expiredToken() {
        String username = "testuser";
        String expiredToken = createTestToken(username, new Date(System.currentTimeMillis() - 1000 * 60)); // 1 minute in the past
        UserDetails userDetails = new User(username, "password", Collections.emptyList());
        assertFalse(jwtUtil.validateToken(expiredToken, userDetails));
    }
}
