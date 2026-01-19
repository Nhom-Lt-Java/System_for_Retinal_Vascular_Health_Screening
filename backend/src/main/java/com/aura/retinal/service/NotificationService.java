package com.aura.retinal.service;

import com.aura.retinal.entity.Notification;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.NotificationRepository;
import com.aura.retinal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired private NotificationRepository notiRepo;
    @Autowired private UserRepository userRepo;

    public void createNotification(Long userId, String title, String message, String type) {
        User user = userRepo.findById(userId).orElse(null);
        if (user != null) {
            Notification noti = new Notification();
            noti.setUser(user);
            noti.setTitle(title);
            noti.setMessage(message);
            noti.setType(type);
            notiRepo.save(noti);
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notiRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public void markAsRead(Long notiId) {
        notiRepo.findById(notiId).ifPresent(n -> {
            n.setIsRead(true);
            notiRepo.save(n);
        });
    }
}