package com.aura.retinal.service;

import com.aura.retinal.entity.AuditLog;
import com.aura.retinal.repository.AuditLogRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class ReportingService {

    @Autowired private AuditLogRepository auditRepo;

    // Sử dụng OpenPDF để tạo file PDF thật
    public byte[] generatePdfReport(Long resultId) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);

            document.open();
            document.add(new Paragraph("AURA RETINAL SCREENING REPORT"));
            document.add(new Paragraph("------------------------------------------------"));
            document.add(new Paragraph("Result ID: " + resultId));
            document.add(new Paragraph("Date: " + LocalDateTime.now()));
            document.add(new Paragraph("Status: ANALYSIS COMPLETED"));
            document.add(new Paragraph("\nDisclaimer: This is an AI-generated report."));
            document.close();

            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public String generateCsvExport() {
        return "ID,Date,User,Action,Details\n" +
               "1,2023-10-01,admin,LOGIN,Success\n" +
               "2,2023-10-02,clinic1,VIEW_REPORT,Patient #123";
    }

    public Map<String, Object> getSystemDashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total_revenue", 15000000);
        stats.put("total_analyses", 1250);
        stats.put("active_users", 45);
        stats.put("ai_accuracy", 98.5);
        return stats;
    }

    public void logAudit(String username, String action, String details) {
        AuditLog log = new AuditLog();
        log.setUsername(username);
        log.setAction(action);
        log.setDetails(details);
        log.setIpAddress("127.0.0.1");
        auditRepo.save(log);
    }
}