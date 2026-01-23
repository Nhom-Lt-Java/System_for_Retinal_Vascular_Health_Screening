package com.aura.retinal.dto.auth;

public record AuthUser(
        Long id,
        String username,
        String role,
        Long clinicId,
        String fullName,
        String firstName,
        String lastName,
        Long assignedDoctorId,
        String email,
        String phone,
        boolean enabled
) {}
