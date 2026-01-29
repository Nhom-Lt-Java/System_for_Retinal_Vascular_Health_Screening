package com.aura.retinal.service;

import com.aura.retinal.entity.OrderTransaction;
import com.aura.retinal.entity.ServicePackage;
import com.aura.retinal.entity.User;
import com.aura.retinal.entity.UserCredit;
import com.aura.retinal.repository.OrderTransactionRepository;
import com.aura.retinal.repository.ServicePackageRepository;
import com.aura.retinal.repository.UserCreditRepository;
import com.aura.retinal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BillingService {

    private final ServicePackageRepository packageRepo;
    private final OrderTransactionRepository orderRepo;
    private final UserCreditRepository creditRepo;
    private final UserRepository userRepo;

    public BillingService(ServicePackageRepository packageRepo, OrderTransactionRepository orderRepo, UserCreditRepository creditRepo, UserRepository userRepo) {
        this.packageRepo = packageRepo;
        this.orderRepo = orderRepo;
        this.creditRepo = creditRepo;
        this.userRepo = userRepo;
    }

    public List<ServicePackage> getActivePackages() {
        return packageRepo.findByActiveTrue();
    }

    @Transactional
    public OrderTransaction purchasePackage(Long userId, Long packageId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        ServicePackage pkg = packageRepo.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found: " + packageId));

        OrderTransaction order = new OrderTransaction();
        order.setUser(user);
        order.setServicePackage(pkg);
        order.setAmount(pkg.getPrice());
        order.setStatus("COMPLETED");
        order.setPaymentMethod("DEMO_WALLET");
        order.setCreatedAt(LocalDateTime.now());
        
        OrderTransaction savedOrder = orderRepo.save(order);

        UserCredit credit = creditRepo.findByUser_Id(userId).orElse(null);
        if (credit == null) {
            credit = new UserCredit();
            credit.setUser(user);
            credit.setRemainingCredits(0);
        }
        
        int added = pkg.getCredits() != null ? pkg.getCredits() : 0;
        credit.setRemainingCredits(credit.getRemainingCredits() + added);
        credit.setUpdatedAt(LocalDateTime.now());
        
        creditRepo.save(credit);

        return savedOrder;
    }

    public UserCredit getUserCredit(Long userId) {
        return creditRepo.findByUser_Id(userId).orElseGet(() -> {
            UserCredit uc = new UserCredit();
            uc.setRemainingCredits(0);
            return uc;
        });
    }

    // --- CÁC HÀM BỊ THIẾU ĐÃ ĐƯỢC BỔ SUNG ---

    /**
     * Trừ 1 credit (Hàm cũ, giữ lại để tương thích nếu có chỗ gọi)
     */
    @Transactional
    public boolean consumeCredit(Long userId) {
        return consumeCredits(userId, 1);
    }

    /**
     * Trừ N credit (Hàm mới để fix lỗi AnalysisService)
     */
    @Transactional
    public boolean consumeCredits(Long userId, int amount) {
        UserCredit credit = creditRepo.findByUser_Id(userId).orElse(null);
        if (credit != null && credit.getRemainingCredits() >= amount) {
            credit.setRemainingCredits(credit.getRemainingCredits() - amount);
            credit.setUpdatedAt(LocalDateTime.now());
            creditRepo.save(credit);
            return true;
        }
        return false;
    }

    /**
     * Hoàn lại 1 credit (Hàm mới để fix lỗi AnalysisProcessingService)
     */
    @Transactional
    public void refundCredit(Long userId) {
        UserCredit credit = creditRepo.findByUser_Id(userId).orElse(null);
        if (credit != null) {
            credit.setRemainingCredits(credit.getRemainingCredits() + 1);
            credit.setUpdatedAt(LocalDateTime.now());
            creditRepo.save(credit);
        }
    }
}