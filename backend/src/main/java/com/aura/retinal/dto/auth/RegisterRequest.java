package com.aura.retinal.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotBlank
    private String fullName;

    private String email;
    private String phone;
    private String role;
    
    // Clinic fields (cho User chọn phòng khám có sẵn)
    private Long clinicId;

    // Clinic fields (cho Clinic Admin tạo phòng khám mới)
    private String clinicName;
    private String clinicAddress;
    private String clinicPhone;
    private String licenseNo;
    
    private String firstName;
    private String lastName;

    // --- GETTERS & SETTERS (Bắt buộc) ---

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    // Clinic Getters/Setters
    public Long getClinicId() { return clinicId; }
    public void setClinicId(Long clinicId) { this.clinicId = clinicId; }

    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }

    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }

    public String getClinicPhone() { return clinicPhone; }
    public void setClinicPhone(String clinicPhone) { this.clinicPhone = clinicPhone; }

    public String getLicenseNo() { return licenseNo; }
    public void setLicenseNo(String licenseNo) { this.licenseNo = licenseNo; }
}