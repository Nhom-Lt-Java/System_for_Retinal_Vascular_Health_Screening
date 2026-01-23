package com.aura.retinal.dto.clinic;

public record ClinicPatientResponse(
        Long id,
        String username,
        String fullName,
        Long assignedDoctorId
) {}
