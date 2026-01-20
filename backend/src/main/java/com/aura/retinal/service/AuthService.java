package com.aura.retinal.service;

import com.aura.retinal.entity.User;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- 1. HÀM ĐĂNG KÝ ---
    public User register(User user) {
    if (userRepo.findByUsername(user.getUsername()).isPresent()) {
        throw new RuntimeException("Tên đăng nhập đã tồn tại!");
    }


    System.out.println("=== KIỂM TRA LÚC ĐĂNG KÝ ===");
    System.out.println("1. Mật khẩu nhận từ Controller: " + user.getPassword());
    

    String encodedPassword = passwordEncoder.encode(user.getPassword());
    user.setPassword(encodedPassword);

    return userRepo.save(user);
}

    // --- 2. HÀM ĐĂNG NHẬP (Đã thêm Logs kiểm tra) ---
    public String login(String username, String password) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        System.out.println("=== KIỂM TRA ĐĂNG NHẬP ===");
        System.out.println("1. Mật khẩu bạn nhập: " + password);
        System.out.println("2. Mật khẩu trong DB: " + user.getPassword());
        // -------------------------------------------------------------

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Sai mật khẩu!");
        }

        return jwtUtil.generateToken(username);
    }
}
