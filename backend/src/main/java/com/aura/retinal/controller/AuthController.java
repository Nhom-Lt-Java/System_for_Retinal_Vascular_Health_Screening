package com.aura.retinal.controller;

import com.aura.retinal.dto.auth.AuthResponse;
import com.aura.retinal.dto.auth.AuthUser;
import com.aura.retinal.dto.auth.LoginRequest;
import com.aura.retinal.dto.auth.LoginResponse;
import com.aura.retinal.dto.auth.RegisterRequest;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepo;

    public AuthController(AuthService authService, UserRepository userRepo) {
        this.authService = authService;
        this.userRepo = userRepo;
    }

    /**
     * Login (supports both JSON body and legacy query params for compatibility).
     */
    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody(required = false) LoginRequest body,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password
    ) {
        String u = body != null ? body.username() : username;
        String p = body != null ? body.password() : password;
        if (u == null || p == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing username/password");
        }

        User db = authService.authenticate(u, p);

        String token = authService.login(u, p);
        AuthUser user = toAuthUser(db);
        return new LoginResponse(token, user, user.role());
    }

    /**
     * Register (demo): USER/DOCTOR/CLINIC
     */
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        User u = authService.register(req);
        String token = authService.login(req.username(), req.password());
        return new AuthResponse(token, toAuthUser(u));
    }

    /**
     * Get current authenticated user
     */
    @GetMapping("/me")
    public AuthUser me(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User u = userRepo.findByUsername(auth.getName()).orElseThrow();
        return toAuthUser(u);
    }

    private static AuthUser toAuthUser(User u) {
        Long clinicId = u.getClinic() != null ? u.getClinic().getId() : null;

        String fullName = u.getFullName();
        if (fullName == null || fullName.isBlank()) {
            String fn = u.getFirstName() == null ? "" : u.getFirstName().trim();
            String ln = u.getLastName() == null ? "" : u.getLastName().trim();
            String merged = (fn + " " + ln).trim();
            fullName = merged.isBlank() ? null : merged;
        }

        return new AuthUser(
                u.getId(),
                u.getUsername(),
                u.getRole().name(),
                clinicId,
                fullName,
                u.getFirstName(),
                u.getLastName(),
                u.getAssignedDoctorId(),
                u.getEmail(),
                u.getPhone(),
                u.isEnabled()
        );
    }

    /**
     * Simple health for FE
     */
    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of("ok", true);
    }
}
