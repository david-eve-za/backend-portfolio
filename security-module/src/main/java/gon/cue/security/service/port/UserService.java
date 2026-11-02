package gon.cue.security.service.port;

import gon.cue.security.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    List<User> findAll();
    User save(User user);
    void deleteById(Long id);
    User updateUsername(Long id, String newUsername);
}
