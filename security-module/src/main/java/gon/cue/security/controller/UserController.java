package gon.cue.security.controller;

import gon.cue.security.dto.UpdateUserDto;
import gon.cue.security.dto.UserDto;
import gon.cue.security.mapper.UserMapper;
import gon.cue.security.service.port.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.findByUsername(userDetails.getUsername())
                .map(userMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid UpdateUserDto updateUserDto) {
        return userService.findByUsername(userDetails.getUsername())
                .map(user -> {
                    userMapper.updateEntity(user, updateUserDto);
                    return userService.save(user);
                })
                .map(userMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserProfileById(@PathVariable Long id) {
        return userService.findById(id)
                .map(userMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(
                userMapper.toDtoList(userService.findAll())
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
