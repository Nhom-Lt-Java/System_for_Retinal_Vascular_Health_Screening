package com.aura.retinal.service;

import com.aura.retinal.entity.Notification;
import com.aura.retinal.entity.NotificationTemplate;
import com.aura.retinal.repository.NotificationRepository;
import com.aura.retinal.repository.NotificationTemplateRepository;
import com.aura.retinal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final NotificationTemplateRepository templateRepo;
    private final UserRepository userRepo;

    public NotificationService(NotificationRepository notificationRepo,
                              NotificationTemplateRepository templateRepo,
                              UserRepository userRepo) {
        this.notificationRepo = notificationRepo;
        this.templateRepo = templateRepo;
        this.userRepo = userRepo;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepo.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    public long countUnread(Long userId) {
        return notificationRepo.countByUser_IdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification n = notificationRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (Boolean.TRUE.equals(n.getIsRead())) return;
        n.setIsRead(true);
        notificationRepo.save(n);
    }

    public Notification createNotification(Long userId, String title, String message, String type) {
        Notification n = new Notification();
        // Use reference to avoid an extra select; will fail later if user not exists.
        n.setUser(userRepo.getReferenceById(userId));
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setIsRead(false);
        n.setCreatedAt(Instant.now());
        return notificationRepo.save(n);
    }

    /**
     * Create a notification based on template_key.
     * Placeholders format: {key}
     */
    public Notification createFromTemplate(Long userId, String templateKey, Map<String, Object> vars) {
        NotificationTemplate t = templateRepo.findByTemplateKey(templateKey)
                .filter(NotificationTemplate::isActive)
                .orElse(null);

        if (t == null) {
            // fallback
            return createNotification(userId, templateKey, "", "SYSTEM");
        }

        String title = render(t.getTitleTemplate(), vars);
        String msg = render(t.getMessageTemplate(), vars);
        return createNotification(userId, title, msg, t.getType());
    }

    private static String render(String tpl, Map<String, Object> vars) {
        if (tpl == null) return null;
        String out = tpl;
        if (vars != null) {
            for (var e : vars.entrySet()) {
                String k = e.getKey();
                Object v = e.getValue();
                out = out.replace("{" + k + "}", v == null ? "" : String.valueOf(v));
            }
        }
        return out;
    }
}
