package com.aura.retinal.controller;

import com.aura.retinal.entity.Notification;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.NotificationRepository;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.service.NotificationService;
import com.aura.retinal.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    @Autowired private NotificationService notiService;
    @Autowired private UserContextService userContext;
    @Autowired private UserRepository userRepo;
    @Autowired private NotificationRepository notiRepo;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId, Authentication auth) {
        User actor = userContext.requireUser(auth);
        enforceNotificationAccess(actor, userId);
        return ResponseEntity.ok(notiService.getUserNotifications(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication auth) {
        User actor = userContext.requireUser(auth);
        Notification n = notiRepo.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Notification not found"));

        Long ownerId = (n.getUser() != null) ? n.getUser().getId() : null;
        if (ownerId != null) {
            enforceNotificationAccess(actor, ownerId);
        } else if (actor.getRole() != Role.ADMIN) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Forbidden");
        }

        notiService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // Internal: Backend 2 gọi khi có kết quả
    @PostMapping("/internal/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createNotification(@RequestParam Long userId,
                                                @RequestParam String title,
                                                @RequestParam String message) {
        notiService.createNotification(userId, title, message, "SYSTEM");
        return ResponseEntity.ok().build();
    }

    private void enforceNotificationAccess(User actor, Long userId) {
        if (actor.getRole() == Role.ADMIN) return;
        if (actor.getId().equals(userId)) return;

        User target = userRepo.findById(userId).orElse(null);
        if (target == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found");
        }

        if (actor.getRole() == Role.CLINIC && actor.getClinic() != null && target.getClinic() != null) {
            if (actor.getClinic().getId().equals(target.getClinic().getId())) return;
        }

        if (actor.getRole() == Role.DOCTOR) {
            if (target.getAssignedDoctorId() != null && target.getAssignedDoctorId().equals(actor.getId())) return;
        }

        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Forbidden");
    }
}
