package com.aura.retinal.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private String role;

    public AuthResponse(String accessToken, String username, String role) {
        this.accessToken = accessToken;
        this.username = username;
        this.role = role;
    }
}