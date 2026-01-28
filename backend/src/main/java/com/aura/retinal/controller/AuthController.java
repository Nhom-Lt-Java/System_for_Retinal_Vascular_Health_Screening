package com.aura.retinal.controller;

import com.aura.retinal.dto.auth.AuthUser;
import com.aura.retinal.dto.auth.LoginRequest;
import com.aura.retinal.dto.auth.LoginResponse;
import com.aura.retinal.dto.auth.RegisterRequest;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
     * API Đăng nhập: Trả về Token để Client lưu vào LocalStorage
     */
    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody(required = false) LoginRequest body,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password
    ) {
        // Ưu tiên lấy từ Body (JSON), nếu không có thì lấy từ Query Param
        String u = (body != null && body.getUsername() != null) ? body.getUsername() : username;
        String p = (body != null && body.getPassword() != null) ? body.getPassword() : password;

        if (u == null || p == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tài khoản và mật khẩu");
        }

        // 1. Xác thực user từ DB
        User db = authService.authenticate(u, p);

        // 2. Sinh Token
        String token = authService.login(u, p);
        
        // 3. Convert sang DTO để trả về FE
        AuthUser user = toAuthUser(db);
        
        return new LoginResponse(token, user, user.role());
    }

    /**
     * API Đăng ký: Chỉ trả về thông báo thành công để FE chuyển hướng
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        // Gọi service đăng ký (Lưu user vào DB)
        authService.register(req);
        
        // Trả về 200 OK + Message
        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công! Vui lòng đăng nhập."));
    }

    /**
     * API lấy thông tin User hiện tại (dựa trên Token gửi lên Header)
     */
    @GetMapping("/me")
    public AuthUser me(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa xác thực");
        }
        User u = userRepo.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        return toAuthUser(u);
    }

    // Helper: Chuyển đổi Entity User -> DTO AuthUser
    private static AuthUser toAuthUser(User u) {
        Long clinicId = u.getClinic() != null ? u.getClinic().getId() : null;
        
        String fullName = u.getFullName();
        if (fullName == null || fullName.isBlank()) {
            String fn = u.getFirstName() == null ? "" : u.getFirstName().trim();
            String ln = u.getLastName() == null ? "" : u.getLastName().trim();
            fullName = (fn + " " + ln).trim();
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

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of("ok", true);
    }
}