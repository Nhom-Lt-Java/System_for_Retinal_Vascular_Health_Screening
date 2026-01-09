package com.aura.retinal.dto.doctor;

import java.time.Instant;
import java.util.UUID;

public record PatientSummaryResponse(
        Long id,
        String username,
        UUID latestAnalysisId,
        String latestStatus,
        String predLabel,
        Double predConf,
        Instant lastAnalyzedAt
) {}
