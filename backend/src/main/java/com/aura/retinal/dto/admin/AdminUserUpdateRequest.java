package com.aura.retinal.dto.admin;

public record AdminUserUpdateRequest(
        String email,
        String phone,
        String fullName,
        String role,
        Boolean enabled,
        Long clinicId,
        Long assignedDoctorId
) {}
