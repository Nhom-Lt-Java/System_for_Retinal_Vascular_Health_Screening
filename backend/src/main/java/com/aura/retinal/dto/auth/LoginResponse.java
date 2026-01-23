package com.aura.retinal.dto.auth;

public record LoginResponse(
        String token,
        AuthUser user,
        String role
) {}
