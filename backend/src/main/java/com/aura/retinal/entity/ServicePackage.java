package com.aura.retinal.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "service_packages")
@Data
public class ServicePackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private BigDecimal price;
    private Integer credits; // Số lượt phân tích
    private Integer durationDays; // Thời hạn gói (nếu có)
    private Boolean active; // Cho phép bán hay không
}