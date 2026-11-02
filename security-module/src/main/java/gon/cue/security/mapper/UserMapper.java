package gon.cue.security.mapper;

import gon.cue.security.dto.UpdateUserDto;
import gon.cue.security.dto.UserDto;
import gon.cue.security.model.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(user.getId(), user.getUsername());
    }

    public List<UserDto> toDtoList(List<User> users) {
        return users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void updateEntity(User entity, UpdateUserDto dto) {
        if (dto != null && dto.getUsername() != null) {
            entity.setUsername(dto.getUsername());
        }
    }
}
