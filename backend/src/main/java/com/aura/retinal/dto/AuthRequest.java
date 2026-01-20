package com.aura.retinal.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String role; // "admin" hoặc "user"
    private String adminKey; // Mã bí mật để đăng ký admin
}