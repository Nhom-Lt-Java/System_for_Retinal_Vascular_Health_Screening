package com.aura.retinal.service;

import com.aura.retinal.dto.auth.RegisterRequest;
import com.aura.retinal.entity.Clinic;
import com.aura.retinal.entity.ClinicStatus;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.ClinicRepository;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final ClinicRepository clinicRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder encoder;

    public AuthService(UserRepository userRepo, ClinicRepository clinicRepo, JwtUtil jwtUtil, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.clinicRepo = clinicRepo;
        this.jwtUtil = jwtUtil;
        this.encoder = encoder;
    }

    public User authenticate(String identifier, String password) {
        if (identifier == null || identifier.isBlank()) {
            throw new RuntimeException("Tài khoản không được để trống");
        }
        User user = userRepo.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("Tài khoản hoặc mật khẩu không đúng"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không đúng");
        }
        return user;
    }

    public String login(String identifier, String password) {
        User user = authenticate(identifier, password);
        return jwtUtil.generateToken(user.getUsername());
    }

    @Transactional
    public User register(RegisterRequest req) {
        // 1. Kiểm tra trùng username (Dùng getter)
        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        // 2. Xác định Role
        Role role;
        try {
            String roleStr = (req.getRole() == null || req.getRole().isBlank()) ? "USER" : req.getRole().toUpperCase();
            if (roleStr.equals("CLINIC_ADMIN")) roleStr = "CLINIC";
            role = Role.valueOf(roleStr);
        } catch (Exception e) {
            role = Role.USER;
        }

        // 3. Khởi tạo User Entity
        User u = new User();
        u.setUsername(req.getUsername());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setRole(role);
        u.setEmail(req.getEmail());
        u.setEnabled(true);
        
        u.setFullName(req.getFullName());
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        
        // Ưu tiên số điện thoại cá nhân, nếu không có thì lấy số phòng khám
        String phone = req.getPhone() != null ? req.getPhone() : req.getClinicPhone();
        u.setPhone(phone);

        // 4. Xử lý Logic Phòng Khám

        // Trường hợp A: CLINIC ADMIN tạo phòng khám mới
        if (role == Role.CLINIC) {
            Clinic c = new Clinic();
            c.setName(req.getClinicName() != null ? req.getClinicName() : "Phòng khám chưa đặt tên");
            c.setStatus(ClinicStatus.PENDING);
            c.setAddress(req.getClinicAddress());
            c.setPhone(req.getClinicPhone());
            c.setLicenseNo(req.getLicenseNo());
            
            c = clinicRepo.save(c);
            u.setClinic(c);
        }
        
        // Trường hợp B: USER (Bệnh nhân) chọn phòng khám có sẵn (Logic Mới)
        else if (role == Role.USER && req.getClinicId() != null) {
            Clinic existingClinic = clinicRepo.findById(req.getClinicId()).orElse(null);
            if (existingClinic != null) {
                u.setClinic(existingClinic);
            }
        }

        return userRepo.save(u);
    }
}