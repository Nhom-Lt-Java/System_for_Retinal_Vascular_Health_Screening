package com.aura.retinal.controller;

import com.aura.retinal.entity.PrivacySetting;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.PrivacySettingRepository;
import com.aura.retinal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/privacy")
public class PrivacyController {

    @Autowired private PrivacySettingRepository privacyRepo;
    @Autowired private UserRepository userRepo;

    @GetMapping("/{userId}")
    public ResponseEntity<PrivacySetting> getSettings(@PathVariable Long userId) {
        // Tự động tạo setting mặc định nếu chưa có
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(privacyRepo.findByUserId(userId)
                .orElseGet(() -> privacyRepo.save(new PrivacySetting(user))));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<PrivacySetting> updateSettings(@PathVariable Long userId, @RequestBody PrivacySetting newSettings) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        PrivacySetting setting = privacyRepo.findByUserId(userId).orElse(new PrivacySetting(user));
        
        setting.setAllowDataCollection(newSettings.getAllowDataCollection());
        setting.setShareResultsWithResearch(newSettings.getShareResultsWithResearch());
        
        return ResponseEntity.ok(privacyRepo.save(setting));
    }
}