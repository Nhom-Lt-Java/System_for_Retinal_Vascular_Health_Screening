package com.aura.retinal.repository;

import com.aura.retinal.entity.OrderTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Import @Query
import org.springframework.stereotype.Repository;

import java.math.BigDecimal; // Import BigDecimal
import java.util.List;

@Repository
public interface OrderTransactionRepository extends JpaRepository<OrderTransaction, Long> {
    
    // Lấy lịch sử mua hàng của user
    List<OrderTransaction> findByUser_Id(Long userId);

    // --- BỔ SUNG HÀM NÀY ĐỂ SỬA LỖI BUILD ---
    // Tính tổng tiền của các đơn hàng có trạng thái 'COMPLETED'
    // COALESCE(..., 0) để trả về 0 thay vì null nếu chưa có đơn nào
    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM OrderTransaction o WHERE o.status = 'COMPLETED'")
    BigDecimal sumCompletedAmount();
}