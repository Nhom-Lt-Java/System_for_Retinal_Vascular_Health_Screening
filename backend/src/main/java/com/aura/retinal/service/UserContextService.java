package com.aura.retinal.service;

import com.aura.retinal.entity.User;
import com.aura.retinal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserContextService {

    private final UserRepository userRepo;

    public UserContextService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public User requireUser(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return userRepo.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public User tryGetUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                return null;
            }
            return userRepo.findByUsername(auth.getName()).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}