package com.aura.retinal.controller;

import com.aura.retinal.entity.AiSetting;
import com.aura.retinal.entity.User;
import com.aura.retinal.service.AiSettingService;
import com.aura.retinal.service.UserContextService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/ai-settings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAiSettingController {

    private final AiSettingService settingService;
    private final UserContextService userContext;

    public AdminAiSettingController(AiSettingService settingService, UserContextService userContext) {
        this.settingService = settingService;
        this.userContext = userContext;
    }

    @GetMapping
    public Map<String, JsonNode> getAll() {
        return settingService.getAll();
    }

    @PutMapping("/{key}")
    public AiSetting upsert(@PathVariable String key,
                            @RequestBody JsonNode value,
                            Authentication auth) {
        User admin = userContext.requireUser(auth);
        return settingService.upsert(key, value, admin);
    }
}
