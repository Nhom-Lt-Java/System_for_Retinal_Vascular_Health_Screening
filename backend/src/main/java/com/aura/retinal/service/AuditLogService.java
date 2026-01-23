package com.aura.retinal.service;

import com.aura.retinal.entity.AuditLog;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository repo;

    public AuditLogService(AuditLogRepository repo) {
        this.repo = repo;
    }

    public void log(String action, User user, String details, String ipAddress) {
        AuditLog l = new AuditLog();
        l.setAction(action);
        l.setUsername(user != null ? user.getUsername() : null);
        l.setDetails(details);
        l.setIpAddress(ipAddress);
        repo.save(l);
    }
}
