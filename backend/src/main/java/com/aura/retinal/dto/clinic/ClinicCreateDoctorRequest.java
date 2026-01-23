package com.aura.retinal.dto.clinic;

import jakarta.validation.constraints.NotBlank;

/**
 * FR-23: Clinic creates doctor accounts inside their clinic.
 * Demo request (username + password + profile fields).
 */
public record ClinicCreateDoctorRequest(
        @NotBlank String username,
        @NotBlank String password,
        String fullName,
        String phone
) {}
