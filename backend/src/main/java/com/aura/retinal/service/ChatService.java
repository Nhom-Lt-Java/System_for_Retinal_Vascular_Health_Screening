package com.aura.retinal.service;

import com.aura.retinal.dto.chat.ContactDto;
import com.aura.retinal.entity.ChatMessage;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.ChatMessageRepository;
import com.aura.retinal.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatRepo;
    private final UserRepository userRepo;

    public ChatService(ChatMessageRepository chatRepo, UserRepository userRepo) {
        this.chatRepo = chatRepo;
        this.userRepo = userRepo;
    }

    public List<ContactDto> getConversations(Long currentUserId) {
        User currentUser = userRepo.findById(currentUserId).orElseThrow();
        Set<User> contacts = new HashSet<>();

        // 1. Lấy history
        List<ChatMessage> history = chatRepo.findBySenderIdOrReceiverId(currentUserId, currentUserId);
        for (ChatMessage msg : history) {
            if (msg.getSenderId().equals(currentUserId)) {
                userRepo.findById(msg.getReceiverId()).ifPresent(contacts::add);
            } else {
                userRepo.findById(msg.getSenderId()).ifPresent(contacts::add);
            }
        }

        // 2. Logic Assigned
        if (currentUser.getRole() == Role.USER) {
            if (currentUser.getAssignedDoctorId() != null) {
                userRepo.findById(currentUser.getAssignedDoctorId()).ifPresent(contacts::add);
            }
        } else if (currentUser.getRole() == Role.DOCTOR) {
            List<User> patients = userRepo.findByAssignedDoctor_Id(currentUserId);
            contacts.addAll(patients);
        }

        // 3. Convert DTO
        return contacts.stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .map(u -> new ContactDto(
                        u.getId(),
                        u.getUsername(),
                        u.getFullName() != null ? u.getFullName() : u.getUsername(),
                        u.getRole().name(),
                        null
                ))
                .sorted((c1, c2) -> {
                    String n1 = c1.getFullName() != null ? c1.getFullName() : "";
                    String n2 = c2.getFullName() != null ? c2.getFullName() : "";
                    return n1.compareToIgnoreCase(n2);
                })
                .collect(Collectors.toList());
    }

    public List<ChatMessage> getMessages(Long userId1, Long userId2) {
        List<ChatMessage> sent = chatRepo.findBySenderIdAndReceiverId(userId1, userId2);
        List<ChatMessage> received = chatRepo.findBySenderIdAndReceiverId(userId2, userId1);
        
        List<ChatMessage> all = new ArrayList<>();
        all.addAll(sent);
        all.addAll(received);
        
        // Sort by Time
        all.sort((m1, m2) -> {
            if (m1.getCreatedAt() == null || m2.getCreatedAt() == null) return 0;
            return m1.getCreatedAt().compareTo(m2.getCreatedAt());
        });
        
        return all;
    }

    public ChatMessage sendMessage(Long senderId, Long receiverId, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setSenderId(senderId);
        msg.setReceiverId(receiverId);
        msg.setContent(content);
        return chatRepo.save(msg);
    }
}