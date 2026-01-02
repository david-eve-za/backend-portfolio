package com.example.security.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

/**
 * Service for loading user-specific data.
 * This implementation provides a basic in-memory user for demonstration purposes.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    /**
     * Loads user details by username.
     * In a real application, this would interact with a database or other user store.
     * @param username The username to retrieve.
     * @return UserDetails containing user information.
     * @throws UsernameNotFoundException if the user is not found.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // For demonstration, use a hardcoded user
        if ("user".equals(username)) {
            return new User("user", "{noop}password", new ArrayList<>()); // {noop} for no password encoding
        }
        throw new UsernameNotFoundException("User not found with username: " + username);
    }
}
