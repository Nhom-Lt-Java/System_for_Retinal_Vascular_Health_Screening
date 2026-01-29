package com.aura.retinal.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Import mới
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="clinics")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // <--- THÊM DÒNG NÀY ĐỂ SỬA LỖI
public class Clinic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    private String address;
    private String phone;

    @Column(name = "license_no")
    private String licenseNo;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private ClinicStatus status = ClinicStatus.PENDING;

    // --- GETTERS & SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLicenseNo() { return licenseNo; }
    public void setLicenseNo(String licenseNo) { this.licenseNo = licenseNo; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public ClinicStatus getStatus() { return status; }
    public void setStatus(ClinicStatus status) { this.status = status; }
}