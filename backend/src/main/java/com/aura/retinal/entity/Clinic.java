package com.aura.retinal.entity;

import jakarta.persistence.*;

@Entity
@Table(name="clinics")
public class Clinic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private ClinicStatus status = ClinicStatus.PENDING;

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ClinicStatus getStatus() { return status; }
    public void setStatus(ClinicStatus status) { this.status = status; }
}
