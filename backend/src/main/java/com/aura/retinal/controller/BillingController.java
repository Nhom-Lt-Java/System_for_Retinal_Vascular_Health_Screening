package com.aura.retinal.controller;

import com.aura.retinal.entity.OrderTransaction;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.ServicePackage;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.OrderTransactionRepository;
import com.aura.retinal.service.BillingService;
import com.aura.retinal.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
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

    /**
     * Mode 1: payment demo nhưng ghi DB thật (order + credits).
     * - USER chỉ được mua cho chính họ
     * - CLINIC chỉ được mua cho chính tài khoản clinic
     */
    @PostMapping("/purchase")
    @PreAuthorize("hasAnyRole('USER', 'CLINIC')")
    public ResponseEntity<OrderTransaction> purchasePackage(
            @RequestParam Long userId,
            @RequestParam Long packageId,
            Authentication auth) {

        User actor = userContext.requireUser(auth);
        if ((actor.getRole() == Role.USER || actor.getRole() == Role.CLINIC) && !actor.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(billingService.purchasePackage(userId, packageId));
    }

    @GetMapping("/balance/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'CLINIC', 'ADMIN')")
    public ResponseEntity<?> getCreditBalance(@PathVariable Long userId, Authentication auth) {
        User actor = userContext.requireUser(auth);
        enforceOwnerOrAdmin(actor, userId);
        return ResponseEntity.ok(billingService.getUserCredit(userId));
    }

    /** Payment history (FR-12). */
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

    // Internal endpoint cho Backend 2 gọi
    @PostMapping("/consume")
    public ResponseEntity<Boolean> consumeCredit(@RequestParam Long userId) {
        boolean success = billingService.consumeCredit(userId);
        return success ? ResponseEntity.ok(true) : ResponseEntity.badRequest().body(false);
    }

    private static void enforceOwnerOrAdmin(User actor, Long userId) {
        if (actor.getRole() == Role.ADMIN) return;
        if (actor.getId().equals(userId)) return;
        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Forbidden");
    }

    public record OrderSummary(Long id,
                               Long packageId,
                               String packageName,
                               BigDecimal amount,
                               String status,
                               String paymentMethod,
                               LocalDateTime createdAt) {}
}
