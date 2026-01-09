package com.aura.retinal.dto.doctor;

import java.time.Instant;
import java.util.UUID;

public record RecentAnalysisResponse(
        UUID analysisId,
        Long patientId,
        String patientUsername,
        String status,
        String predLabel,
        Double predConf,
        Instant createdAt
) {}
