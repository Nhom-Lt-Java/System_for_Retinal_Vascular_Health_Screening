package com.retinalscreening.backend2_orchestrator.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "analysis_jobs")
public class AnalysisJob {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private UUID userId; // Mã bệnh nhân
    private String imageUrl; // Link ảnh Cloudinary
    private String status;   // QUEUED, PENDING, COMPLETED, FAILED
    private LocalDateTime createdAt;

    // --- CÁC TRƯỜNG MỚI (Theo yêu cầu FR-3, FR-15, FR-16) ---

    // 1. Kết quả từ AI (FR-3)
    private String aiRiskLevel; // Ví dụ: "HIGH", "LOW", "NORMAL"
    @Column(length = 2000)      // Cho phép lưu đoạn văn dài
    private String aiFindings;  // Mô tả tổn thương phát hiện

    // 2. Phần bác sĩ xác nhận (FR-15, FR-16)
    @Column(length = 2000)
    private String doctorNotes;    // Ghi chú của bác sĩ
    private String finalDiagnosis; // Kết luận cuối cùng
    private LocalDateTime confirmedAt; // Thời điểm bác sĩ xác nhận

    // Getters và Setters (Bắt buộc phải có để code chạy)
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    // Getter/Setter cho các trường mới
    public String getAiRiskLevel() { return aiRiskLevel; }
    public void setAiRiskLevel(String aiRiskLevel) { this.aiRiskLevel = aiRiskLevel; }
    public String getAiFindings() { return aiFindings; }
    public void setAiFindings(String aiFindings) { this.aiFindings = aiFindings; }
    public String getDoctorNotes() { return doctorNotes; }
    public void setDoctorNotes(String doctorNotes) { this.doctorNotes = doctorNotes; }
    public String getFinalDiagnosis() { return finalDiagnosis; }
    public void setFinalDiagnosis(String finalDiagnosis) { this.finalDiagnosis = finalDiagnosis; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
}