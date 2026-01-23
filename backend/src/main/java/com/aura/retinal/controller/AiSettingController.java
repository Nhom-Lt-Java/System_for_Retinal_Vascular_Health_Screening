package com.aura.retinal.controller;

import com.aura.retinal.service.AiSettingService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai-settings")
@PreAuthorize("isAuthenticated()")
public class AiSettingController {

    private final AiSettingService settingService;

    public AiSettingController(AiSettingService settingService) {
        this.settingService = settingService;
    }

    @GetMapping
    public Map<String, Object> getPublicSettings() {
        String version = settingService.getModelVersionOrDefault("0.1.0");
        JsonNode thresholds = settingService.getThresholdsOrEmpty();
        return Map.of(
                "model_version", version,
                "thresholds", thresholds
        );
    }
}
