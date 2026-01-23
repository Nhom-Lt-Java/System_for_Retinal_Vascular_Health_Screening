package com.aura.retinal.repository;

import com.aura.retinal.entity.UserCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserCreditRepository extends JpaRepository<UserCredit, Long> {
    Optional<UserCredit> findByUser_Id(Long userId);
}