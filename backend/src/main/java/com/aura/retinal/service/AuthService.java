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
     * Authenticate with username OR email.
     * Returns the User if valid, otherwise throws RuntimeException.
     */
    public User authenticate(String identifier, String password) {
        if (identifier == null || identifier.isBlank()) {
            throw new RuntimeException("Missing username/email");
        }

        User user = userRepo.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Account disabled");
        }

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }

        // Demo rule: if clinic is not approved, block CLINIC and DOCTOR login
        if ((user.getRole() == Role.CLINIC || user.getRole() == Role.DOCTOR)
                && user.getClinic() != null
                && user.getClinic().getStatus() != ClinicStatus.APPROVED) {
            throw new RuntimeException("Clinic not approved");
        }

        return user;
    }

    public String login(String identifier, String password) {
        User user = authenticate(identifier, password);
        // JWT subject uses username for consistency
        return jwtUtil.generateToken(user.getUsername());
    }

    @Transactional
    public User register(RegisterRequest req) {
        if (userRepo.findByUsername(req.username()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        if (req.email() != null && !req.email().isBlank()) {
            // quick pre-check for nicer message; DB constraint is the source of truth
            userRepo.findByUsernameOrEmail(req.email(), req.email()).ifPresent(u -> {
                if (u.getEmail() != null && u.getEmail().equalsIgnoreCase(req.email())) {
                    throw new RuntimeException("Email already exists");
                }
            });
        }

        Role role;
        try {
            role = Role.valueOf((req.role() == null || req.role().isBlank()) ? "USER" : req.role().toUpperCase());
        } catch (Exception e) {
            role = Role.USER;
        }

        User u = new User();
        u.setUsername(req.username());
        u.setPassword(encoder.encode(req.password()));
        u.setRole(role);
        u.setEmail(req.email());
        u.setEnabled(true);

        u.setFirstName(req.firstName());
        u.setLastName(req.lastName());
        u.setFullName(req.fullName());
        u.setPhone(req.phone() != null ? req.phone() : req.clinicPhone());

        // If role = CLINIC, create clinic record as PENDING + bind to user
        if (role == Role.CLINIC) {
            Clinic c = new Clinic();
            c.setName(req.clinicName() != null ? req.clinicName() : "Clinic");
            c.setStatus(ClinicStatus.PENDING);
            c.setAddress(req.clinicAddress());
            c.setPhone(req.clinicPhone());
            c.setLicenseNo(req.licenseNo());
            c = clinicRepo.save(c);
            u.setClinic(c);
        }

        return userRepo.save(u);
    }
}
