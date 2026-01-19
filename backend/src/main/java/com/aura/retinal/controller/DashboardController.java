package com.aura.retinal.controller;

import com.aura.retinal.service.ReportingService;
import com.aura.retinal.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    @Autowired private ReportingService reportingService;
    @Autowired private AuditLogRepository auditRepo;

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {
        return ResponseEntity.ok(reportingService.getSystemDashboard());
    }
    
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(auditRepo.findTop100ByOrderByTimestampDesc());
    }
}