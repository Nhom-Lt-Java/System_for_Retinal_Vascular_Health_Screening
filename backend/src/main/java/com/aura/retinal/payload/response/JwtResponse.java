package com.aura.retinal.payload.response;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String role;

    public JwtResponse(String accessToken, String role) {
        this.token = accessToken;
        this.role = role;
    }

    // Getters & Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return type; }
    public void setTokenType(String type) { this.type = type; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}