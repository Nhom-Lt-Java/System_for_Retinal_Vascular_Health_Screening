package com.aura.retinal.controller;

import com.aura.retinal.entity.ChatMessage;
import com.aura.retinal.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class ChatController {

    @Autowired private ChatService chatService;

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getHistory(@RequestParam Long user1, @RequestParam Long user2) {
        return ResponseEntity.ok(chatService.getConversation(user1, user2));
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage message) {
        return ResponseEntity.ok(chatService.sendMessage(
                message.getSenderId(), 
                message.getReceiverId(), 
                message.getContent()));
    }
}