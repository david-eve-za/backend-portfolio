package gon.cue.security.service.port;

import gon.cue.security.model.AuthRequest;
import gon.cue.security.model.AuthResponse;

public interface AuthService {
    AuthResponse authenticate(AuthRequest authRequest);
}
