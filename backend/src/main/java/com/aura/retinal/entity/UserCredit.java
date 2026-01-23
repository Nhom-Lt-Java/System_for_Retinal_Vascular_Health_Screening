package com.aura.retinal.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_credits")
@Data
public class UserCredit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private Integer remainingCredits;
    private Integer totalUsed;

    @PrePersist
    protected void onCreate() {
        if (remainingCredits == null) remainingCredits = 0;
        if (totalUsed == null) totalUsed = 0;
    }

    public UserCredit() {}
    
    public UserCredit(User user) {
        this.user = user;
        this.remainingCredits = 0;
        this.totalUsed = 0;
    }
}