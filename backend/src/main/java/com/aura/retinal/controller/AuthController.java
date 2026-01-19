package com.aura.retinal.controller;

import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.payload.request.SignupRequest;
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
            return ResponseEntity.ok(new JwtResponse(token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Đăng ký
    @PostMapping("/register/client")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        // Kiểm tra nhanh ở Controller trước
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Lỗi: Tên đăng nhập đã tồn tại!");
        }

        try {
            // 👇 SỬA QUAN TRỌNG: Không mã hóa ở đây nữa!
            // Gửi mật khẩu thô sang Service, để Service tự mã hóa.
            User user = new User(signUpRequest.getUsername(),
                                 signUpRequest.getEmail(),
                                 signUpRequest.getPassword()); // <--- ĐỂ NGUYÊN (RAW)

            user.setFullName(signUpRequest.getFullName());

            // Xử lý Role
            String strRole = signUpRequest.getRole();
            if (strRole == null) {
                user.setRole(Role.USER);
            } else {
                switch (strRole) {
                    case "ADMIN": user.setRole(Role.ADMIN); break;
                    case "DOCTOR": user.setRole(Role.DOCTOR); break;
                    default: user.setRole(Role.USER);
                }
            }

            authService.register(user);

            return ResponseEntity.ok("Đăng ký thành công!");

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

class LoginRequest {
    private String username;
    private String password;
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class JwtResponse {
    private String token;
    public JwtResponse(String token) { this.token = token; }
    public String getToken() { return token; }
}