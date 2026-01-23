package com.aura.retinal.controller;

import com.aura.retinal.dto.profile.ProfileResponse;
import com.aura.retinal.dto.profile.ProfileUpdateRequest;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.service.UserContextService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserContextService userContext;
    private final UserRepository userRepo;

    public ProfileController(UserContextService userContext, UserRepository userRepo) {
        this.userContext = userContext;
        this.userRepo = userRepo;
    }

    @GetMapping("/me")
    public ProfileResponse me(Authentication auth) {
        User u = userContext.requireUser(auth);
        return toResponse(u);
    }

    @PutMapping("/me")
    public ProfileResponse updateMe(@Valid @RequestBody ProfileUpdateRequest req, Authentication auth) {
        User u = userContext.requireUser(auth);

        // update allowed fields only
        if (req.email() != null) u.setEmail(blankToNull(req.email()));
        if (req.phone() != null) u.setPhone(blankToNull(req.phone()));
        if (req.firstName() != null) u.setFirstName(blankToNull(req.firstName()));
        if (req.lastName() != null) u.setLastName(blankToNull(req.lastName()));
        if (req.fullName() != null) u.setFullName(blankToNull(req.fullName()));
        if (req.address() != null) u.setAddress(blankToNull(req.address()));
        if (req.dateOfBirth() != null) u.setDateOfBirth(req.dateOfBirth());
        if (req.gender() != null) u.setGender(blankToNull(req.gender()));
        if (req.emergencyContact() != null) u.setEmergencyContact(blankToNull(req.emergencyContact()));
        if (req.medicalInfo() != null) u.setMedicalInfoJson(req.medicalInfo());

        try {
            u = userRepo.save(u);
        } catch (Exception e) {
            // common case: email unique violation
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        return toResponse(u);
    }

    private static ProfileResponse toResponse(User u) {
        return new ProfileResponse(
                u.getId(),
                u.getUsername(),
                u.getRole() != null ? u.getRole().name() : null,
                u.isEnabled(),
                u.getEmail(),
                u.getPhone(),
                u.getFirstName(),
                u.getLastName(),
                u.getFullName(),
                u.getAddress(),
                u.getDateOfBirth(),
                u.getGender(),
                u.getEmergencyContact(),
                u.getMedicalInfoJson()
        );
    }

    private static String blankToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
