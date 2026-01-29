package com.aura.retinal.controller;

import com.aura.retinal.dto.chat.ContactDto; // Đảm bảo đã có file DTO này
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
@RequestMapping("/api/chat") // <--- ĐỔI TỪ /api/messages THÀNH /api/chat ĐỂ KHỚP FRONTEND
@PreAuthorize("isAuthenticated()")
public class ChatController {

    @Autowired private ChatService chatService;
    @Autowired private UserContextService userContext;
    @Autowired private UserRepository userRepo;

    // API MỚI: Lấy danh sách những người đã chat (Fix lỗi 404 trên Console)
    @GetMapping("/conversations")
    public ResponseEntity<List<ContactDto>> getConversations(Authentication auth) {
        User actor = userContext.requireUser(auth);
        return ResponseEntity.ok(chatService.getConversations(actor.getId()));
    }

    // API CŨ: Lấy nội dung tin nhắn
    @GetMapping("/history") // Frontend gọi: /api/chat/history
    public ResponseEntity<List<ChatMessage>> getHistory(@RequestParam Long user1,
                                                        @RequestParam Long user2,
                                                        Authentication auth) {
        User actor = userContext.requireUser(auth);
        // Cho phép xem nếu là người trong cuộc hoặc Admin
        if (!actor.getId().equals(user1) && !actor.getId().equals(user2) && actor.getRole() != Role.ADMIN) {
             // Nếu là người ngoài, check quyền bác sĩ/phòng khám
             enforceChatAccess(actor, user1, user2);
        }
        return ResponseEntity.ok(chatService.getMessages(user1, user2));
    }

    // API Gửi tin
    @PostMapping("/send") // Frontend gọi: /api/chat/send
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage message, Authentication auth) {
        User actor = userContext.requireUser(auth);
        if (message.getSenderId() == null || message.getReceiverId() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // Sender phải là chính mình
        if (actor.getRole() != Role.ADMIN && !actor.getId().equals(message.getSenderId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(chatService.sendMessage(
                message.getSenderId(),
                message.getReceiverId(),
                message.getContent()));
    }

    private void enforceChatAccess(User actor, Long user1, Long user2) {
        if (actor.getRole() == Role.ADMIN) return;
        
        User u1 = userRepo.findById(user1).orElse(null);
        User u2 = userRepo.findById(user2).orElse(null);
        if (u1 == null || u2 == null) return; 

        // Doctor check
        if (actor.getRole() == Role.DOCTOR) {
            Long did = actor.getId();
            boolean assigned1 = u1.getAssignedDoctorId() != null && did.equals(u1.getAssignedDoctorId());
            boolean assigned2 = u2.getAssignedDoctorId() != null && did.equals(u2.getAssignedDoctorId());
            if (assigned1 || assigned2) return;
        }
        
        // Clinic check
        if (actor.getRole() == Role.CLINIC && actor.getClinic() != null) {
             Long cid = actor.getClinic().getId();
             if (u1.getClinic() != null && cid.equals(u1.getClinic().getId())) return;
        }

        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Không có quyền xem tin nhắn này");
    }
}