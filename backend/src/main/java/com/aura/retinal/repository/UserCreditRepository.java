package com.aura.retinal.repository;

import com.aura.retinal.entity.UserCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCreditRepository extends JpaRepository<UserCredit, Long> {
    // Tìm ví tiền theo User ID
    Optional<UserCredit> findByUser_Id(Long userId);
}