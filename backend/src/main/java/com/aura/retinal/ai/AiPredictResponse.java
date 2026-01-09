package com.aura.retinal.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiPredictResponse(
        String pred_label,
        double pred_conf,
        JsonNode probs,
        double vessel_threshold,
        Artifacts artifacts
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Artifacts(
            String overlay_key,
            String mask_key,
            String heatmap_key,
            String heatmap_overlay_key,
            long overlay_size,
            long mask_size,
            long heatmap_size,
            long heatmap_overlay_size
    ) {}
}
