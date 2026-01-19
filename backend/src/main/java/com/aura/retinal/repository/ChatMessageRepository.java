package com.aura.retinal.repository;

import com.aura.retinal.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // Lấy tin nhắn giữa 2 người
    List<ChatMessage> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(
        Long senderId1, Long receiverId1, Long senderId2, Long receiverId2
    );
}