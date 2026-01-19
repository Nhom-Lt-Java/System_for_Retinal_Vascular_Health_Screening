package com.aura.retinal.controller;

import com.aura.retinal.entity.Notification;
import com.aura.retinal.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private NotificationService notiService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notiService.getUserNotifications(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notiService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
    
    // Internal: Backend 2 gọi khi có kết quả
    @PostMapping("/internal/create")
    public ResponseEntity<?> createNotification(@RequestParam Long userId, 
                                                @RequestParam String title, 
                                                @RequestParam String message) {
        notiService.createNotification(userId, title, message, "SYSTEM");
        return ResponseEntity.ok().build();
    }
}