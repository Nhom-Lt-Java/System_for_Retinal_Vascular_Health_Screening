package com.aura.retinal.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "privacy_settings")
@Data
public class PrivacySetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private Boolean allowDataCollection; // Cho phép thu thập dữ liệu cải thiện AI
    private Boolean shareResultsWithResearch; // Chia sẻ ẩn danh cho nghiên cứu
    
    public PrivacySetting() {}
    public PrivacySetting(User user) {
        this.user = user;
        this.allowDataCollection = true; // Mặc định là true
        this.shareResultsWithResearch = false;
    }
}