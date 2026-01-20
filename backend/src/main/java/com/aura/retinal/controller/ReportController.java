package com.aura.retinal.controller;

import com.aura.retinal.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired private ReportingService reportingService;

    @GetMapping("/pdf/{resultId}")
    @PreAuthorize("hasAnyRole('USER', 'CLINIC', 'ADMIN')")
    public ResponseEntity<byte[]> downloadPdfReport(@PathVariable Long resultId) {
        byte[] pdfContent = reportingService.generatePdfReport(resultId);
        
        reportingService.logAudit("UNKNOWN", "EXPORT_PDF", "Result ID: " + resultId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report_" + resultId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }

    @GetMapping("/csv")
    @PreAuthorize("hasAnyRole('CLINIC', 'ADMIN')")
    public ResponseEntity<String> exportCsv() {
        String csv = reportingService.generateCsvExport();
        reportingService.logAudit("UNKNOWN", "EXPORT_CSV", "Campaign stats");
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stats.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv);
    }
}