package com.aura.retinal.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AnalysisResponse(
        UUID id,
        String status,
        String predLabel,
        Double predConf,
        JsonNode probs,
        String riskLevel,
        List<String> advice,
        String originalUrl,
        String overlayUrl,
        String maskUrl,
        String heatmapUrl,
        String heatmapOverlayUrl,
        String doctorConclusion,
        String doctorNote,
        Instant reviewedAt,
        Long reviewedById,
        String aiVersion,
        JsonNode thresholds,
        String errorMessage,
        Instant createdAt,
        Instant updatedAt
) {}
