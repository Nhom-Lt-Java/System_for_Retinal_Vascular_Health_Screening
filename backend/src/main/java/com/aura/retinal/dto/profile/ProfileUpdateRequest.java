package com.aura.retinal.dto.profile;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDate;

public record ProfileUpdateRequest(
        String email,
        String phone,
        String firstName,
        String lastName,
        String fullName,
        String address,
        LocalDate dateOfBirth,
        String gender,
        String emergencyContact,
        JsonNode medicalInfo
) {}
