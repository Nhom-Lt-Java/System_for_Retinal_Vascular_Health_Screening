package com.aura.retinal.service;

import com.aura.retinal.entity.ChatMessage;
import com.aura.retinal.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {
    @Autowired private ChatMessageRepository chatRepo;

    public ChatMessage sendMessage(Long senderId, Long receiverId, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setSenderId(senderId);
        msg.setReceiverId(receiverId);
        msg.setContent(content);
        return chatRepo.save(msg);
    }

    public List<ChatMessage> getConversation(Long user1, Long user2) {
        return chatRepo.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(
                user1, user2, user2, user1
        );
    }
}