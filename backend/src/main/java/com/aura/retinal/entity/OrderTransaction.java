package com.aura.retinal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_transactions")
public class OrderTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với User (Người mua)
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Liên kết với Gói dịch vụ
    @ManyToOne
    @JoinColumn(name = "package_id", nullable = false)
    private ServicePackage servicePackage;

    @Column(nullable = false)
    private BigDecimal amount;

    // Trạng thái: PENDING, COMPLETED, FAILED
    @Column(nullable = false)
    private String status;

    // Phương thức thanh toán: VNPAY, MOMO, DEMO_WALLET
    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // --- GETTERS & SETTERS (BẮT BUỘC PHẢI CÓ) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public ServicePackage getServicePackage() { return servicePackage; }
    public void setServicePackage(ServicePackage servicePackage) { this.servicePackage = servicePackage; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}