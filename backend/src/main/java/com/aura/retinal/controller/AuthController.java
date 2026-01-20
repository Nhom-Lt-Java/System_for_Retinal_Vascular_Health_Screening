package com.aura.retinal.controller;

import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.payload.request.LoginRequest;
import com.aura.retinal.payload.request.SignupRequest; // Import file vừa tạo
import com.aura.retinal.payload.response.JwtResponse;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    AuthService authService;

    // API Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            String token = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
            User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
            return ResponseEntity.ok(new JwtResponse(token, user.getRole().name()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Sai thông tin đăng nhập!");
        }
    }

    // API Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Lỗi: Tên đăng nhập đã tồn tại!");
        }

        try {
            User user = new User();
            user.setUsername(signUpRequest.getUsername());
            user.setEmail(signUpRequest.getEmail());
            user.setPassword(signUpRequest.getPassword()); 
            user.setFullName(signUpRequest.getFullName());

            // Xử lý Role
            String strRole = signUpRequest.getRole();
            if (strRole == null) {
                user.setRole(Role.USER);
            } else {
                switch (strRole) {
                    case "ADMIN": 
                    case "SUPER_ADMIN":
                        user.setRole(Role.SUPER_ADMIN); 
                        break;
                    case "DOCTOR": 
                        user.setRole(Role.DOCTOR); 
                        break;
                    case "CLINIC_ADMIN": 
                        user.setRole(Role.CLINIC_ADMIN); 
                        break;
                    default: 
                        user.setRole(Role.USER);
                }
            }

            authService.register(user);
            return ResponseEntity.ok("Đăng ký thành công!");

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}