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

    /**
     * Xác thực người dùng (Dùng cho API Login)
     */
    public User authenticate(String identifier, String password) {
        if (identifier == null || identifier.isBlank()) {
            throw new RuntimeException("Tài khoản không được để trống");
        }

        // Tìm user theo username HOẶC email (Để user đăng nhập bằng cái nào cũng được)
        User user = userRepo.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("Tài khoản hoặc mật khẩu không đúng"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }

        // So khớp mật khẩu đã mã hóa
        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không đúng");
        }

        // --- LOGIC CHECK PHÒNG KHÁM (BẬT LẠI KHI CẦN) ---
        /*
        if ((user.getRole() == Role.CLINIC || user.getRole() == Role.DOCTOR)
                && user.getClinic() != null
                && user.getClinic().getStatus() != ClinicStatus.APPROVED) {
            throw new RuntimeException("Phòng khám của bạn chưa được duyệt.");
        }
        */
        // ------------------------------------------------

        return user;
    }

    /**
     * Sinh JWT Token sau khi xác thực thành công
     */
    public String login(String identifier, String password) {
        // authenticate() sẽ ném lỗi nếu login sai, nên ở đây chắc chắn user đúng
        User user = authenticate(identifier, password);
        return jwtUtil.generateToken(user.getUsername());
    }

    /**
     * Đăng ký tài khoản mới
     */
    @Transactional
    public User register(RegisterRequest req) {
        // 1. Kiểm tra trùng username
        if (userRepo.findByUsername(req.username()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        // 2. Kiểm tra trùng email (nếu cần thiết, bỏ comment dòng dưới)
        // if (userRepo.findByEmail(req.email()).isPresent()) {
        //    throw new RuntimeException("Email đã được sử dụng");
        // }

        // 3. Xác định Role (Mặc định là USER nếu lỗi hoặc null)
        Role role;
        try {
            String roleStr = (req.role() == null || req.role().isBlank()) ? "USER" : req.role().toUpperCase();
            // Map CLINIC_ADMIN từ FE về CLINIC trong DB nếu cần
            if (roleStr.equals("CLINIC_ADMIN")) roleStr = "CLINIC";
            role = Role.valueOf(roleStr);
        } catch (Exception e) {
            role = Role.USER;
        }

        // 4. Khởi tạo User Entity
        User u = new User();
        u.setUsername(req.username());
        u.setPassword(encoder.encode(req.password())); // Bắt buộc mã hóa
        u.setRole(role);
        u.setEmail(req.email());
        u.setEnabled(true); // Mặc định kích hoạt ngay (hoặc false nếu cần verify email)
        
        u.setFullName(req.fullName());
        // Tách họ tên đơn giản nếu firstName/lastName null (Optional)
        u.setFirstName(req.firstName());
        u.setLastName(req.lastName());
        
        String phone = req.phone() != null ? req.phone() : req.clinicPhone();
        u.setPhone(phone);

        // 5. Xử lý Logic riêng cho Phòng Khám (CLINIC)
        if (role == Role.CLINIC) {
            Clinic c = new Clinic();
            c.setName(req.clinicName() != null ? req.clinicName() : "Phòng khám chưa đặt tên");
            c.setStatus(ClinicStatus.PENDING); // Chờ Admin duyệt
            c.setAddress(req.clinicAddress());
            c.setPhone(req.clinicPhone());
            c.setLicenseNo(req.licenseNo());
            
            c = clinicRepo.save(c); // Lưu Clinic trước
            u.setClinic(c);         // Gán Clinic cho User
        }

        return userRepo.save(u);
    }
}