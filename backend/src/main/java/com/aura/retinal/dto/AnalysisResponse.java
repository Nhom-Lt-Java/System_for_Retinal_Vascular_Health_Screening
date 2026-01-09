package com.aura.retinal.dto;

import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

public record AnalysisResponse(
        UUID id,
        String status,
        String predLabel,
        double predConf,
        JsonNode probs,   // hoặc probsJson
        String originalUrl,
        String overlayUrl,
        String maskUrl,
        String heatUrl,
        String heatOvUrl,
        java.time.Instant createdAt
) {}
