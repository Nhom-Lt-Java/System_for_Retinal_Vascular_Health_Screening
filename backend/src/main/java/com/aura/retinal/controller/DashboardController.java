package com.aura.retinal.controller;

import com.aura.retinal.repository.AuditLogRepository;
import com.aura.retinal.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ResponseEntity<?> getAuditLogs(@RequestParam(value = "limit", defaultValue = "50") int limit) {
        int safe = Math.max(1, Math.min(limit, 500));
        var pageable = PageRequest.of(0, safe, Sort.by(Sort.Direction.DESC, "timestamp"));
        return ResponseEntity.ok(auditRepo.findAll(pageable).getContent());
    }
}
