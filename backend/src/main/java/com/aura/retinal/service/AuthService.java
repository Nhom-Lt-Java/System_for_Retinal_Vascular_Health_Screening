package com.aura.retinal.service;

import com.aura.retinal.entity.*;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    public String login(String username, String password) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(password))
            throw new RuntimeException("Wrong password");

        if (user.getRole() == Role.DOCTOR &&
                user.getClinic().getStatus() != ClinicStatus.APPROVED) {
            throw new RuntimeException("Clinic not approved");
        }

        return jwtUtil.generateToken(username);
    }
}
