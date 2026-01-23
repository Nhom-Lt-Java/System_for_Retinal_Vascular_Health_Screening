package com.aura.retinal.dto.admin;

public record AdminUserResponse(
        Long id,
        String username,
        String email,
        String phone,
        String role,
        boolean enabled,
        Long clinicId,
        String clinicName,
        Long assignedDoctorId,
        String fullName
) {}
