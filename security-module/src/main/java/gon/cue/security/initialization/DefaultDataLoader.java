package gon.cue.security.initialization;

import gon.cue.security.model.Role;
import gon.cue.security.model.User;
import gon.cue.security.repository.RoleRepository;
import gon.cue.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DefaultDataLoader {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public void loadDefaultData() {
        // Create roles if they don't exist
        Role userRole = roleRepository.findByName("ROLE_USER").orElseGet(() -> {
            Role newUserRole = new Role(null, "ROLE_USER");
            return roleRepository.save(newUserRole);
        });

        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
            Role newAdminRole = new Role(null, "ROLE_ADMIN");
            return roleRepository.save(newAdminRole);
        });

        // Create default user if not exists
        if (userRepository.findByUsername("user").isEmpty()) {
            Set<Role> roles = new HashSet<>();
            roles.add(userRole);
            User defaultUser = new User(null, "user", passwordEncoder.encode("password"), roles);
            userRepository.save(defaultUser);
        }

        // Create admin user if not exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            Set<Role> roles = new HashSet<>();
            roles.add(userRole);
            roles.add(adminRole);
            User adminUser = new User(null, "admin", passwordEncoder.encode("adminpassword"), roles);
            userRepository.save(adminUser);
        }
    }
}