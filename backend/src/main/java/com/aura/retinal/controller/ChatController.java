package com.aura.retinal.controller;

import com.aura.retinal.entity.ChatMessage;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.service.ChatService;
import com.aura.retinal.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@PreAuthorize("isAuthenticated()")
public class ChatController {

    @Autowired private ChatService chatService;
    @Autowired private UserContextService userContext;
    @Autowired private UserRepository userRepo;

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getHistory(@RequestParam Long user1,
                                                        @RequestParam Long user2,
                                                        Authentication auth) {
        User actor = userContext.requireUser(auth);
        enforceChatAccess(actor, user1, user2);
        return ResponseEntity.ok(chatService.getConversation(user1, user2));
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage message, Authentication auth) {
        User actor = userContext.requireUser(auth);
        if (message.getSenderId() == null || message.getReceiverId() == null) {
            return ResponseEntity.badRequest().build();
        }
        // Sender must be the actor (unless ADMIN)
        if (actor.getRole() != Role.ADMIN && !actor.getId().equals(message.getSenderId())) {
            return ResponseEntity.status(403).build();
        }
        enforceChatAccess(actor, message.getSenderId(), message.getReceiverId());
        return ResponseEntity.ok(chatService.sendMessage(
                message.getSenderId(),
                message.getReceiverId(),
                message.getContent()));
    }

    private void enforceChatAccess(User actor, Long user1, Long user2) {
        if (actor.getRole() == Role.ADMIN) return;
        if (actor.getId().equals(user1) || actor.getId().equals(user2)) return;

        User u1 = userRepo.findById(user1).orElse(null);
        User u2 = userRepo.findById(user2).orElse(null);
        if (u1 == null || u2 == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found");
        }

        // Clinic: allow if both users are in same clinic as actor
        if (actor.getRole() == Role.CLINIC && actor.getClinic() != null) {
            Long cid = actor.getClinic().getId();
            if (u1.getClinic() != null && u2.getClinic() != null
                    && cid.equals(u1.getClinic().getId())
                    && cid.equals(u2.getClinic().getId())) {
                return;
            }
        }

        // Doctor: allow if either user is a patient assigned to actor
        if (actor.getRole() == Role.DOCTOR) {
            Long did = actor.getId();
            if (u1.getAssignedDoctorId() != null && did.equals(u1.getAssignedDoctorId())) return;
            if (u2.getAssignedDoctorId() != null && did.equals(u2.getAssignedDoctorId())) return;
        }

        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Forbidden");
    }
}