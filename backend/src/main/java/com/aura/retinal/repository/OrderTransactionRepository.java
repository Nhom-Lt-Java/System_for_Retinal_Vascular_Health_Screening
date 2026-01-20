package com.aura.retinal.repository;

import com.aura.retinal.entity.OrderTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderTransactionRepository extends JpaRepository<OrderTransaction, Long> {
    List<OrderTransaction> findByUserId(Long userId);
}