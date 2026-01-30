package com.aura.retinal.controller;

import com.aura.retinal.dto.auth.AuthUser;
import com.aura.retinal.dto.auth.LoginRequest;
import com.aura.retinal.dto.auth.LoginResponse;
import com.aura.retinal.dto.auth.RegisterRequest;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.ClinicRepository; // Import
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired; // Import
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepo;
    
    @Autowired // Inject ClinicRepository
    private ClinicRepository clinicRepo;

    public AuthController(AuthService authService, UserRepository userRepo) {
        this.authService = authService;
        this.userRepo = userRepo;
    }

    /**
     * API Đăng nhập
     */
    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody(required = false) LoginRequest body,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password
    ) {
        String u = (body != null && body.getUsername() != null) ? body.getUsername() : username;
        String p = (body != null && body.getPassword() != null) ? body.getPassword() : password;

        if (u == null || p == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tài khoản và mật khẩu");
        }

        User db = authService.authenticate(u, p);
        String token = authService.login(u, p);
        AuthUser user = toAuthUser(db);
        
        return new LoginResponse(token, user, user.role());
    }

    /**
     * API Đăng ký
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        // Kiểm tra username trước khi gọi service
        if (userRepo.existsByUsername(req.getUsername())) {
             return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập đã tồn tại!"));
        }

        // Gọi service đăng ký (Logic gán Clinic đã được chuyển vào AuthService)
        authService.register(req);
        
        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công! Vui lòng đăng nhập."));
    }

    /**
     * API MỚI: Lấy danh sách phòng khám (Public) cho Frontend Dropdown
     */
    @GetMapping("/clinics")
    public List<ClinicSummary> getPublicClinics() {
        return clinicRepo.findAll().stream()
                .map(c -> new ClinicSummary(c.getId(), c.getName(), c.getAddress()))
                .collect(Collectors.toList());
    }
    public record ClinicSummary(Long id, String name, String address) {}

    /**
     * API lấy thông tin User hiện tại
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