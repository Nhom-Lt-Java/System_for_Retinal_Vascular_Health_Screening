package com.aura.retinal.controller;

import com.aura.retinal.dto.auth.AuthUser;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.service.AuthService;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepo;

    public AuthController(AuthService authService, UserRepository userRepo) {
        this.authService = authService;
        this.userRepo = userRepo;
    }

    // Giữ nguyên API hiện tại (FE đang gọi bằng query params)
    @PostMapping("/login")
    public java.util.Map<String, String> login(
            @RequestBody(required = false) LoginRequest body,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password
    ) {
        String u = body != null ? body.username() : username;
        String p = body != null ? body.password() : password;

        if (u == null || p == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Missing username/password"
            );
        }

        String token = authService.login(u, p);
        return java.util.Map.of("token", token);
    }

    public record LoginRequest(String username, String password) {}


    // NEW: FE gọi sau khi login để lấy userId + role thật từ DB
    @GetMapping("/me")
    public AuthUser me(Authentication auth) {
        User u = userRepo.findByUsername(auth.getName()).orElseThrow();
        return new AuthUser(u.getId(), u.getUsername(), u.getRole().name());
    }
}
