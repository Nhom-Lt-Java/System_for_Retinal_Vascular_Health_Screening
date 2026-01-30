package com.aura.retinal.controller;

import com.aura.retinal.entity.OrderTransaction;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.ServicePackage;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.OrderTransactionRepository;
import com.aura.retinal.service.BillingService;
import com.aura.retinal.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired private BillingService billingService;
    @Autowired private UserContextService userContext;
    @Autowired private OrderTransactionRepository orderRepo;

    @GetMapping("/packages")
    public ResponseEntity<List<ServicePackage>> getAllPackages() {
        return ResponseEntity.ok(billingService.getActivePackages());
    }

    @PostMapping("/purchase")
    @PreAuthorize("hasAnyRole('USER', 'CLINIC', 'ADMIN')")
    public ResponseEntity<?> purchasePackage(
            @RequestParam Long userId,
            @RequestParam Long packageId,
            Authentication auth) {

        System.out.println(">>> REQUEST: User " + userId + " mua goi " + packageId);

        try {
            User actor = userContext.requireUser(auth);
            
            // Nếu không phải ADMIN thì chỉ được mua cho chính mình
            if (actor.getRole() != Role.ADMIN && !actor.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Lỗi: Bạn không thể mua gói cho người khác.");
            }

            OrderTransaction order = billingService.purchasePackage(userId, packageId);
            return ResponseEntity.ok(order);

        } catch (Exception e) {
            // QUAN TRỌNG: In lỗi ra console để debug
            System.err.println("============ BILLING ERROR ============");
            e.printStackTrace(); 
            System.err.println("=======================================");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi Server: " + e.getMessage());
        }
    }

    @GetMapping("/balance/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'CLINIC', 'ADMIN')")
    public ResponseEntity<?> getCreditBalance(@PathVariable Long userId, Authentication auth) {
        try {
            User actor = userContext.requireUser(auth);
            enforceOwnerOrAdmin(actor, userId);
            return ResponseEntity.ok(billingService.getUserCredit(userId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi lấy số dư: " + e.getMessage());
        }
    }

    @GetMapping("/orders/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'CLINIC', 'ADMIN')")
    public ResponseEntity<List<OrderSummary>> getOrders(@PathVariable Long userId, Authentication auth) {
        User actor = userContext.requireUser(auth);
        enforceOwnerOrAdmin(actor, userId);
        
        List<OrderSummary> out = orderRepo.findByUser_Id(userId).stream()
                .map(o -> new OrderSummary(
                        o.getId(),
                        o.getServicePackage() != null ? o.getServicePackage().getId() : null,
                        o.getServicePackage() != null ? o.getServicePackage().getName() : null,
                        o.getAmount() != null ? o.getAmount() : BigDecimal.ZERO,
                        o.getStatus(),
                        o.getPaymentMethod(),
                        o.getCreatedAt()
                ))
                .toList();
        return ResponseEntity.ok(out);
    }

    @GetMapping("/orders/my")
    @PreAuthorize("hasAnyRole('USER', 'CLINIC', 'ADMIN')")
    public ResponseEntity<List<OrderSummary>> myOrders(Authentication auth) {
        User actor = userContext.requireUser(auth);
        return getOrders(actor.getId(), auth);
    }

    @PostMapping("/consume")
    public ResponseEntity<Boolean> consumeCredit(@RequestParam Long userId) {
        boolean success = billingService.consumeCredits(userId, 1);
        return success ? ResponseEntity.ok(true) : ResponseEntity.badRequest().body(false);
    }

    private static void enforceOwnerOrAdmin(User actor, Long userId) {
        if (actor.getRole() == Role.ADMIN) return;
        if (actor.getId().equals(userId)) return;
        throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
    }

    public record OrderSummary(Long id, Long packageId, String packageName, BigDecimal amount, String status, String paymentMethod, LocalDateTime createdAt) {}
}