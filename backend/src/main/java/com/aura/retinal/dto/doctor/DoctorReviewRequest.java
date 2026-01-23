package com.aura.retinal.dto.doctor;

import jakarta.validation.constraints.NotBlank;

public record DoctorReviewRequest(
        String correctedLabel,
        @NotBlank String conclusion,
        String note
) {}
