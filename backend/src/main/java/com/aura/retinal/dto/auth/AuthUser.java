package com.aura.retinal.dto.auth;

public record AuthUser(
        Long id,
        String username,
        String role
) {
}
