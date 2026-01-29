package com.aura.retinal.repository;

import com.aura.retinal.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Tìm tất cả tin nhắn mà user là người gửi HOẶC người nhận (để xây danh sách contact)
    List<ChatMessage> findBySenderIdOrReceiverId(Long senderId, Long receiverId);

    // Tìm tin nhắn 1 chiều cụ thể (để lấy nội dung chat)
    List<ChatMessage> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
}