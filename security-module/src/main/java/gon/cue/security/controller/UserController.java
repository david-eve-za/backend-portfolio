package gon.cue.security.controller;

import gon.cue.security.dto.UpdateUserDto;
import gon.cue.security.dto.UserDto;
import gon.cue.security.model.User;
import gon.cue.security.service.port.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Helper method to convert User to UserDto
    private UserDto convertToDto(User user) {
        return new UserDto(user.getId(), user.getUsername());
    }

    /**
     * @api {get} /api/users/me Get Current User Profile
     * @apiName GetCurrentUserProfile
     * @apiGroup User
     * @apiPermission authenticated
     *
     * @apiSuccess {Long} id User ID.
     * @apiSuccess {String} username User's username.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.findByUsername(userDetails.getUsername())
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * @api {put} /api/users/me Update Current User Profile
     * @apiName UpdateCurrentUserProfile
     * @apiGroup User
     * @apiPermission authenticated
     *
     * @apiParam {String} username New username.
     *
     * @apiSuccess {Long} id User ID.
     * @apiSuccess {String} username Updated username.
     */
    @PutMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateUserDto updateUserDto) {
        return userService.findByUsername(userDetails.getUsername())
                .map(user -> {
                    user.setUsername(updateUserDto.getUsername());
                    // In a real application, handle password changes separately and securely
                    return userService.save(user);
                })
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * @api {get} /api/users/:id Get User Profile by ID
     * @apiName GetUserProfileById
     * @apiGroup User
     * @apiPermission admin
     *
     * @apiParam {Long} id User's unique ID.
     *
     * @apiSuccess {Long} id User ID.
     * @apiSuccess {String} username User's username.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserProfileById(@PathVariable Long id) {
        return userService.findById(id)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * @api {get} /api/users Get All Users
     * @apiName GetAllUsers
     * @apiGroup User
     * @apiPermission admin
     *
     * @apiSuccess {Object[]} users List of user objects.
     * @apiSuccess {Long} users.id User ID.
     * @apiSuccess {String} users.username User's username.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /**
     * @api {delete} /api/users/:id Delete User by ID
     * @apiName DeleteUserById
     * @apiGroup User
     * @apiPermission admin
     *
     * @apiParam {Long} id User's unique ID.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 204 No Content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}