package com.aura.retinal.controller.admin;

import com.aura.retinal.dto.admin.AdminUserResponse;
import com.aura.retinal.dto.admin.AdminUserUpdateRequest;
import com.aura.retinal.entity.Clinic;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.ClinicRepository;
import com.aura.retinal.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepo;
    private final ClinicRepository clinicRepo;

    public AdminUserController(UserRepository userRepo, ClinicRepository clinicRepo) {
        this.userRepo = userRepo;
        this.clinicRepo = clinicRepo;
    }

    @GetMapping
    public List<AdminUserResponse> list(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "enabled", required = false) Boolean enabled
    ) {
        String query = q == null ? "" : q.trim().toLowerCase();
        String roleUp = role == null ? "" : role.trim().toUpperCase();

        return userRepo.findAll().stream()
                .filter(u -> query.isBlank()
                        || (u.getUsername() != null && u.getUsername().toLowerCase().contains(query))
                        || (u.getEmail() != null && u.getEmail().toLowerCase().contains(query))
                        || (u.getFullName() != null && u.getFullName().toLowerCase().contains(query)))
                .filter(u -> roleUp.isBlank() || (u.getRole() != null && u.getRole().name().equalsIgnoreCase(roleUp)))
                .filter(u -> enabled == null || u.isEnabled() == enabled)
                .map(AdminUserController::toResponse)
                .toList();
    }

    @PutMapping("/{id}")
    public AdminUserResponse update(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest req) {
        User u = userRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (req.email() != null) u.setEmail(blankToNull(req.email()));
        if (req.phone() != null) u.setPhone(blankToNull(req.phone()));
        if (req.fullName() != null) u.setFullName(blankToNull(req.fullName()));

        if (req.role() != null && !req.role().isBlank()) {
            try {
                u.setRole(Role.valueOf(req.role().trim().toUpperCase()));
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
            }
        }

        if (req.enabled() != null) u.setEnabled(req.enabled());

        if (req.clinicId() != null) {
            Clinic c = clinicRepo.findById(req.clinicId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Clinic not found"));
            u.setClinic(c);
        }

        if (req.assignedDoctorId() != null) {
            User d = userRepo.findById(req.assignedDoctorId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor not found"));
            if (d.getRole() != Role.DOCTOR) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "assignedDoctorId must be a DOCTOR");
            }
            u.setAssignedDoctor(d);
        }

        try {
            u = userRepo.save(u);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        return toResponse(u);
    }

    @PostMapping("/{id}/enable")
    public AdminUserResponse enable(@PathVariable Long id) {
        User u = userRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        u.setEnabled(true);
        return toResponse(userRepo.save(u));
    }

    @PostMapping("/{id}/disable")
    public AdminUserResponse disable(@PathVariable Long id) {
        User u = userRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        u.setEnabled(false);
        return toResponse(userRepo.save(u));
    }

    private static AdminUserResponse toResponse(User u) {
        Long clinicId = u.getClinic() != null ? u.getClinic().getId() : null;
        String clinicName = u.getClinic() != null ? u.getClinic().getName() : null;
        return new AdminUserResponse(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getPhone(),
                u.getRole() != null ? u.getRole().name() : null,
                u.isEnabled(),
                clinicId,
                clinicName,
                u.getAssignedDoctorId(),
                u.getFullName()
        );
    }

    private static String blankToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
