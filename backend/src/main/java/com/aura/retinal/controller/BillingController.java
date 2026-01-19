package com.aura.retinal.controller;

import com.aura.retinal.entity.OrderTransaction;
import com.aura.retinal.entity.ServicePackage;
import com.aura.retinal.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired private BillingService billingService;

    @GetMapping("/packages")
    public ResponseEntity<List<ServicePackage>> getAllPackages() {
        return ResponseEntity.ok(billingService.getActivePackages());
    }

    @PostMapping("/purchase")
    @PreAuthorize("hasAnyRole('USER', 'CLINIC')")
    public ResponseEntity<OrderTransaction> purchasePackage(
            @RequestParam Long userId,
            @RequestParam Long packageId) {
        return ResponseEntity.ok(billingService.purchasePackage(userId, packageId));
    }

    @GetMapping("/balance/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'CLINIC', 'ADMIN')")
    public ResponseEntity<?> getCreditBalance(@PathVariable Long userId) {
        return ResponseEntity.ok(billingService.getUserCredit(userId));
    }
    
    // Internal endpoint cho Backend 2 gọi
    @PostMapping("/consume")
    public ResponseEntity<Boolean> consumeCredit(@RequestParam Long userId) {
        boolean success = billingService.consumeCredit(userId);
        return success ? ResponseEntity.ok(true) : ResponseEntity.badRequest().body(false);
    }
}