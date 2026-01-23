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
        UserCredit credit = creditRepo.findByUser_Id(userId).orElse(new UserCredit(user));
        int currentCredits = credit.getRemainingCredits() == null ? 0 : credit.getRemainingCredits();
        credit.setRemainingCredits(currentCredits + pkg.getCredits());
        creditRepo.save(credit);

        return order;
    }

    public UserCredit getUserCredit(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return creditRepo.findByUser_Id(userId).orElse(new UserCredit(user));
    }

    @Transactional
    public boolean consumeCredit(Long userId) {
        try {
            consumeCredits(userId, 1);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    @Transactional
    public void refundCredit(Long userId) {
        refundCredits(userId, 1);
    }

    @Transactional
    public void consumeCredits(Long userId, int count) {
        if (count <= 0) return;
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        UserCredit credit = creditRepo.findByUser_Id(userId).orElse(new UserCredit(user));
        int current = credit.getRemainingCredits() == null ? 0 : credit.getRemainingCredits();
        if (current < count) {
            throw new RuntimeException("Not enough credits");
        }
        credit.setRemainingCredits(current - count);
        int used = credit.getTotalUsed() == null ? 0 : credit.getTotalUsed();
        credit.setTotalUsed(used + count);
        creditRepo.save(credit);
    }

    @Transactional
    public void refundCredits(Long userId, int count) {
        if (count <= 0) return;
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        UserCredit credit = creditRepo.findByUser_Id(userId).orElse(new UserCredit(user));
        int current = credit.getRemainingCredits() == null ? 0 : credit.getRemainingCredits();
        credit.setRemainingCredits(current + count);
        int used = credit.getTotalUsed() == null ? 0 : credit.getTotalUsed();
        credit.setTotalUsed(Math.max(0, used - count));
        creditRepo.save(credit);
    }

}