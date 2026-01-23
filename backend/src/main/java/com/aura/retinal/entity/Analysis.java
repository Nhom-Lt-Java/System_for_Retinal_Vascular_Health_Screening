package com.aura.retinal.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "analysis")
public class Analysis {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String status; // QUEUED/RUNNING/COMPLETED/FAILED/REVIEWED

    private String predLabel;
    private Double predConf;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "probs_json", columnDefinition = "jsonb")
    private JsonNode probsJson;

    // CDS additions
    @Column(name = "risk_level")
    private String riskLevel; // LOW/MED/HIGH/QUALITY_LOW

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "advice_json", columnDefinition = "jsonb")
    private JsonNode adviceJson;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_file_id")
    private StoredFile originalFile;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "overlay_file_id")
    private StoredFile overlayFile;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mask_file_id")
    private StoredFile maskFile;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "heatmap_file_id")
    private StoredFile heatmapFile;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "heatmap_overlay_file_id")
    private StoredFile heatmapOverlayFile;

    // Doctor review
    @Column(name = "doctor_conclusion")
    private String doctorConclusion;

    @Column(name = "doctor_note")
    private String doctorNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    // Traceability
    @Column(name = "ai_version")
    private String aiVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "thresholds_json", columnDefinition = "jsonb")
    private JsonNode thresholdsJson;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
        // DB has NOT NULL defaults for some JSON columns; ensure Hibernate doesn't insert null.
        if (adviceJson == null) adviceJson = JsonNodeFactory.instance.arrayNode();
        if (thresholdsJson == null) thresholdsJson = JsonNodeFactory.instance.objectNode();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPredLabel() { return predLabel; }
    public void setPredLabel(String predLabel) { this.predLabel = predLabel; }

    public Double getPredConf() { return predConf; }
    public void setPredConf(Double predConf) { this.predConf = predConf; }

    public JsonNode getProbsJson() { return probsJson; }
    public void setProbsJson(JsonNode probsJson) { this.probsJson = probsJson; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public JsonNode getAdviceJson() { return adviceJson; }
    public void setAdviceJson(JsonNode adviceJson) { this.adviceJson = adviceJson; }

    public StoredFile getOriginalFile() { return originalFile; }
    public void setOriginalFile(StoredFile originalFile) { this.originalFile = originalFile; }

    public StoredFile getOverlayFile() { return overlayFile; }
    public void setOverlayFile(StoredFile overlayFile) { this.overlayFile = overlayFile; }

    public StoredFile getMaskFile() { return maskFile; }
    public void setMaskFile(StoredFile maskFile) { this.maskFile = maskFile; }

    public StoredFile getHeatmapFile() { return heatmapFile; }
    public void setHeatmapFile(StoredFile heatmapFile) { this.heatmapFile = heatmapFile; }

    public StoredFile getHeatmapOverlayFile() { return heatmapOverlayFile; }
    public void setHeatmapOverlayFile(StoredFile heatmapOverlayFile) { this.heatmapOverlayFile = heatmapOverlayFile; }

    public String getDoctorConclusion() { return doctorConclusion; }
    public void setDoctorConclusion(String doctorConclusion) { this.doctorConclusion = doctorConclusion; }

    public String getDoctorNote() { return doctorNote; }
    public void setDoctorNote(String doctorNote) { this.doctorNote = doctorNote; }

    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getAiVersion() { return aiVersion; }
    public void setAiVersion(String aiVersion) { this.aiVersion = aiVersion; }

    public JsonNode getThresholdsJson() { return thresholdsJson; }
    public void setThresholdsJson(JsonNode thresholdsJson) { this.thresholdsJson = thresholdsJson; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
