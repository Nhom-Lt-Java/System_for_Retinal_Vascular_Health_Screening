package com.aura.retinal.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * Demo register:
 * - USER/DOCTOR: create user account
 * - CLINIC: create clinic (PENDING) and a clinic admin account
 */
public record RegisterRequest(
        @NotBlank String username,
        @NotBlank String password,
        String email,
        String phone,
        String role,
        String firstName,
        String lastName,
        String fullName,
        // Clinic fields (optional)
        String clinicName,
        String clinicAddress,
        String clinicPhone,
        String licenseNo
) {}
