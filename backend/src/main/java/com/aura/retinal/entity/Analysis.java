package com.aura.retinal.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.databind.JsonNode;

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
    private String status; // COMPLETED/FAILED/REVIEWED

    private String predLabel;
    private Double predConf;

    // ✅ FIX: map jsonb đúng kiểu JSON (không phải String)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "probs_json", columnDefinition = "jsonb")
    private JsonNode probsJson;

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

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

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

    public Instant getCreatedAt() { return createdAt; }
}
