package com.aura.retinal.service;

import com.aura.retinal.entity.*;
import com.aura.retinal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BillingService {

    @Autowired private ServicePackageRepository packageRepo;
    @Autowired private OrderTransactionRepository orderRepo;
    @Autowired private UserCreditRepository creditRepo;
    @Autowired private UserRepository userRepo;

    public List<ServicePackage> getActivePackages() {
        return packageRepo.findByActiveTrue();
    }

    @Transactional
    public OrderTransaction purchasePackage(Long userId, Long packageId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        ServicePackage pkg = packageRepo.findById(packageId).orElseThrow(() -> new RuntimeException("Package not found"));

        // Tạo order
        OrderTransaction order = new OrderTransaction();
        order.setUser(user);
        order.setServicePackage(pkg);
        order.setAmount(pkg.getPrice());
        order.setStatus("COMPLETED"); // Giả lập thanh toán thành công ngay
        order.setPaymentMethod("MOCK_GATEWAY");
        orderRepo.save(order);

        // Cộng credit
        UserCredit credit = creditRepo.findByUserId(userId).orElse(new UserCredit(user));
        credit.setRemainingCredits(credit.getRemainingCredits() + pkg.getCredits());
        creditRepo.save(credit);

        return order;
    }

    public UserCredit getUserCredit(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return creditRepo.findByUserId(userId).orElse(new UserCredit(user));
    }

    @Transactional
    public boolean consumeCredit(Long userId) {
        UserCredit credit = creditRepo.findByUserId(userId).orElse(null);
        if (credit != null && credit.getRemainingCredits() > 0) {
            credit.setRemainingCredits(credit.getRemainingCredits() - 1);
            credit.setTotalUsed(credit.getTotalUsed() + 1);
            creditRepo.save(credit);
            return true;
        }
        return false;
    }
}