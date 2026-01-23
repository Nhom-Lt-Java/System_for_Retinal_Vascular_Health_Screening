package com.aura.retinal.repository;

import com.aura.retinal.entity.OrderTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface OrderTransactionRepository extends JpaRepository<OrderTransaction, Long> {
    List<OrderTransaction> findByUser_Id(Long userId);

    @Query("select coalesce(sum(o.amount), 0) from OrderTransaction o where o.status = 'COMPLETED'")
    BigDecimal sumCompletedAmount();
}