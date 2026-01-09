package com.aura.retinal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String username;

    @Column(nullable=false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Role role = Role.USER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="clinic_id")
    private Clinic clinic;

    public Long getId() { return id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Clinic getClinic() { return clinic; }
    public void setClinic(Clinic clinic) { this.clinic = clinic; }
}
