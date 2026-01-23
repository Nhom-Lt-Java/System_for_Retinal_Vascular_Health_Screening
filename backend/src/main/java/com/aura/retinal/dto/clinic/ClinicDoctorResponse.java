package com.aura.retinal.dto.clinic;

public record ClinicDoctorResponse(
        Long id,
        String username,
        String fullName,
        String phone
) {}
