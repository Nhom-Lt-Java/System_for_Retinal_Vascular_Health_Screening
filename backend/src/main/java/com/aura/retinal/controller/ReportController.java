package com.aura.retinal.controller;

import com.aura.retinal.entity.User;
import com.aura.retinal.service.ReportingService;
import com.aura.retinal.service.UserContextService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("isAuthenticated()")
public class ReportController {

    private final ReportingService reportingService;
    private final UserContextService userContext;

    public ReportController(ReportingService reportingService, UserContextService userContext) {
        this.reportingService = reportingService;
        this.userContext = userContext;
    }

    /**
     * FR-7: Export PDF report for a single analysis.
     */
    @GetMapping(value = "/pdf/{analysisId}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> pdf(@PathVariable UUID analysisId, Authentication auth) {
        User actor = userContext.requireUser(auth);
        byte[] pdf = reportingService.generatePdfReport(analysisId, actor);

        String filename = "aura_report_%s.pdf".formatted(analysisId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /**
     * FR-7: Export CSV for a single analysis.
     */
    @GetMapping(value = "/csv/{analysisId}", produces = "text/csv")
    public ResponseEntity<byte[]> csvOne(@PathVariable UUID analysisId, Authentication auth) {
        User actor = userContext.requireUser(auth);
        String csv = reportingService.generateSingleAnalysisCsv(analysisId, actor);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"aura_report_" + analysisId + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=utf-8"))
                .body(bytes);
    }

    /**
     * FR-7 / FR-30: Export CSV.
     * - Default: export analysis rows.
     * - mode=stats: export summarized statistics.
     */
    @GetMapping(value = "/csv", produces = "text/csv")
    public ResponseEntity<byte[]> csv(
            @RequestParam(value = "mode", required = false, defaultValue = "analyses") String mode,
            Authentication auth
    ) {
        User actor = userContext.requireUser(auth);
        String csv = reportingService.generateCsvExport(actor, mode);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"aura_export_" + mode + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=utf-8"))
                .body(bytes);
    }
}
