package com.aura.retinal.service;

import com.aura.retinal.entity.Analysis;
import com.aura.retinal.entity.Clinic;
import com.aura.retinal.entity.ClinicStatus;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.AnalysisJobRepository;
import com.aura.retinal.repository.AnalysisRepository;
import com.aura.retinal.repository.ClinicRepository;
import com.aura.retinal.repository.OrderTransactionRepository;
import com.aura.retinal.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ReportingService {

    private final AnalysisRepository analysisRepo;
    private final AnalysisJobRepository jobRepo;
    private final UserRepository userRepo;
    private final ClinicRepository clinicRepo;
    private final OrderTransactionRepository orderRepo;
    private final FileService fileService;

    private final ObjectMapper om = new ObjectMapper();

    private static final DateTimeFormatter TS_FMT = DateTimeFormatter
            .ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneId.systemDefault());

    public ReportingService(AnalysisRepository analysisRepo,
                            AnalysisJobRepository jobRepo,
                            UserRepository userRepo,
                            ClinicRepository clinicRepo,
                            OrderTransactionRepository orderRepo,
                            FileService fileService) {
        this.analysisRepo = analysisRepo;
        this.jobRepo = jobRepo;
        this.userRepo = userRepo;
        this.clinicRepo = clinicRepo;
        this.orderRepo = orderRepo;
        this.fileService = fileService;
    }

    // ==============================================================
    // PDF
    // ==============================================================

    public byte[] generatePdfReport(UUID analysisId, User actor) {
        Analysis a = analysisRepo.findById(analysisId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Analysis not found"));

        enforceAccess(actor, a);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document();
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font title = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font h = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph pTitle = new Paragraph("AURA - Retinal Vascular Health Screening Report", title);
            pTitle.setAlignment(Element.ALIGN_CENTER);
            doc.add(pTitle);
            doc.add(new Paragraph(" "));

            doc.add(new Paragraph("Report ID: " + a.getId(), normal));
            doc.add(new Paragraph("Generated at: " + TS_FMT.format(Instant.now()), normal));
            doc.add(new Paragraph(" "));

            // Patient & clinic
            if (a.getUser() != null) {
                User u = a.getUser();
                doc.add(new Paragraph("Patient", h));
                doc.add(new Paragraph("- User ID: " + u.getId(), normal));
                doc.add(new Paragraph("- Username: " + safe(u.getUsername()), normal));
                doc.add(new Paragraph("- Full name: " + safe(u.getFullName()), normal));

                Clinic c = u.getClinic();
                if (c != null) {
                    doc.add(new Paragraph("- Clinic: " + safe(c.getName()) + " (ID=" + c.getId() + ")", normal));
                }
                doc.add(new Paragraph(" "));
            }

            // Analysis
            doc.add(new Paragraph("Analysis", h));
            doc.add(new Paragraph("- Status: " + safe(a.getStatus()), normal));
            doc.add(new Paragraph("- Created at: " + formatTs(a.getCreatedAt()), normal));
            doc.add(new Paragraph("- Updated at: " + formatTs(a.getUpdatedAt()), normal));
            doc.add(new Paragraph("- AI version: " + safe(a.getAiVersion()), normal));
            if (a.getErrorMessage() != null && !a.getErrorMessage().isBlank()) {
                doc.add(new Paragraph("- Error: " + a.getErrorMessage(), normal));
            }
            doc.add(new Paragraph(" "));

            // Result
            doc.add(new Paragraph("AI Result", h));
            doc.add(new Paragraph("- Prediction label: " + safe(a.getPredLabel()), normal));
            if (a.getPredConf() != null) {
                doc.add(new Paragraph("- Confidence: " + String.format(Locale.US, "%.4f", a.getPredConf()), normal));
            }

            // Probabilities (top 5)
            if (a.getProbsJson() != null && a.getProbsJson().isObject()) {
                doc.add(new Paragraph("- Top probabilities:", normal));
                List<Map.Entry<String, Double>> entries = new ArrayList<>();
                a.getProbsJson().fields().forEachRemaining(e -> {
                    try {
                        entries.add(Map.entry(e.getKey(), e.getValue().asDouble()));
                    } catch (Exception ignored) {
                    }
                });
                entries.sort((x, y) -> Double.compare(y.getValue(), x.getValue()));
                for (int i = 0; i < Math.min(5, entries.size()); i++) {
                    Map.Entry<String, Double> e = entries.get(i);
                    doc.add(new Paragraph("  * " + e.getKey() + ": " + String.format(Locale.US, "%.4f", e.getValue()), normal));
                }
            }

            // Thresholds
            JsonNode th = a.getThresholdsJson();
            if (th != null && !th.isNull() && !th.isMissingNode()) {
                doc.add(new Paragraph("- Thresholds: " + th.toString(), normal));
            }

            doc.add(new Paragraph(" "));

            // Doctor review
            if (a.getDoctorConclusion() != null || a.getDoctorNote() != null || a.getReviewedAt() != null) {
                doc.add(new Paragraph("Doctor Review", h));
                doc.add(new Paragraph("- Conclusion: " + safe(a.getDoctorConclusion()), normal));
                doc.add(new Paragraph("- Note: " + safe(a.getDoctorNote()), normal));
                doc.add(new Paragraph("- Reviewed at: " + (a.getReviewedAt() != null ? TS_FMT.format(a.getReviewedAt()) : ""), normal));
                doc.add(new Paragraph(" "));
            }

            // Images (optional)
            addImageSection(doc, normal, "Original image", a.getOriginalFile() != null ? a.getOriginalFile().getId() : null);
            addImageSection(doc, normal, "Heatmap overlay", a.getHeatmapOverlayFile() != null ? a.getHeatmapOverlayFile().getId() : null);

            doc.add(new Paragraph(" "));
            Paragraph disclaimer = new Paragraph(
                    "Disclaimer: This report is generated by an AI-assisted screening system and is for reference only. " +
                    "It does not replace professional medical diagnosis.",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9)
            );
            disclaimer.setAlignment(Element.ALIGN_CENTER);
            doc.add(disclaimer);

            doc.close();
            return out.toByteArray();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot generate PDF", e);
        }
    }

    private void addImageSection(Document doc, Font normal, String label, UUID fileId) {
        if (fileId == null) return;
        try {
            byte[] bytes = fileService.downloadBytes(fileId);
            Image img = Image.getInstance(bytes);
            img.scaleToFit(480, 480);
            doc.add(new Paragraph(label + " (fileId=" + fileId + ")", normal));
            doc.add(img);
            doc.add(new Paragraph(" "));
        } catch (Exception e) {
            // ignore image errors (e.g., missing object in MinIO) to keep PDF generation stable
        }
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }

    private static String formatTs(Instant ts) {
        return ts == null ? "" : TS_FMT.format(ts);
    }

    // ==============================================================
    // CSV
    // ==============================================================

    public String generateCsvExport(User actor, String mode) {
        String m = (mode == null ? "analyses" : mode).trim().toLowerCase(Locale.ROOT);
        List<Analysis> analyses = resolveExportScope(actor);

        if ("stats".equals(m)) {
            return buildStatsCsv(analyses);
        }
        return buildAnalysesCsv(analyses);
    }

    public String generateSingleAnalysisCsv(UUID analysisId, User actor) {
        Analysis a = analysisRepo.findById(analysisId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Analysis not found"));
        enforceAccess(actor, a);
        return buildAnalysesCsv(List.of(a));
    }

    private List<Analysis> resolveExportScope(User actor) {
        if (actor.getRole() == Role.ADMIN) {
            return analysisRepo.findAllByOrderByCreatedAtDesc();
        }

        if (actor.getRole() == Role.CLINIC) {
            if (actor.getClinic() == null) {
                return List.of();
            }
            return analysisRepo.findByUser_Clinic_IdOrderByCreatedAtDesc(actor.getClinic().getId());
        }

        if (actor.getRole() == Role.DOCTOR) {
            List<User> candidates = userRepo.findByRole(Role.USER);
            List<User> assigned = candidates.stream()
                    .filter(u -> u.getAssignedDoctorId() != null && u.getAssignedDoctorId().equals(actor.getId()))
                    .toList();
            List<User> patients = assigned.isEmpty() ? candidates : assigned;
            List<Long> ids = patients.stream().map(User::getId).toList();
            if (ids.isEmpty()) return List.of();
            return analysisRepo.findByUser_IdInOrderByCreatedAtDesc(ids);
        }

        // USER
        return analysisRepo.findByUser_IdOrderByCreatedAtDesc(actor.getId());
    }

    private String buildAnalysesCsv(List<Analysis> list) {
        StringBuilder sb = new StringBuilder();
        // UTF-8 BOM for Excel friendliness
        sb.append('\ufeff');
        sb.append("analysis_id,user_id,username,clinic_id,clinic_name,status,pred_label,pred_conf,ai_version,created_at,reviewed_at,reviewed_by,doctor_conclusion,error_message\n");

        for (Analysis a : list) {
            User u = a.getUser();
            Clinic c = u != null ? u.getClinic() : null;

            sb.append(csv(a.getId()))
                    .append(',')
                    .append(csv(u != null ? u.getId() : null))
                    .append(',')
                    .append(csv(u != null ? u.getUsername() : null))
                    .append(',')
                    .append(csv(c != null ? c.getId() : null))
                    .append(',')
                    .append(csv(c != null ? c.getName() : null))
                    .append(',')
                    .append(csv(a.getStatus()))
                    .append(',')
                    .append(csv(a.getPredLabel()))
                    .append(',')
                    .append(csv(a.getPredConf()))
                    .append(',')
                    .append(csv(a.getAiVersion()))
                    .append(',')
                    .append(csv(formatTs(a.getCreatedAt())))
                    .append(',')
                    .append(csv(a.getReviewedAt() != null ? TS_FMT.format(a.getReviewedAt()) : null))
                    .append(',')
                    .append(csv(a.getReviewedBy() != null ? a.getReviewedBy().getId() : null))
                    .append(',')
                    .append(csv(a.getDoctorConclusion()))
                    .append(',')
                    .append(csv(a.getErrorMessage()))
                    .append('\n');
        }
        return sb.toString();
    }

    private String buildStatsCsv(List<Analysis> list) {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        Map<String, Long> byLabel = new LinkedHashMap<>();

        for (Analysis a : list) {
            String status = a.getStatus() == null ? "" : a.getStatus();
            byStatus.put(status, byStatus.getOrDefault(status, 0L) + 1);

            String label = a.getPredLabel() == null ? "" : a.getPredLabel();
            byLabel.put(label, byLabel.getOrDefault(label, 0L) + 1);
        }

        StringBuilder sb = new StringBuilder();
        sb.append('\ufeff');
        sb.append("type,key,count\n");

        byStatus.forEach((k, v) -> sb.append("status,").append(csv(k)).append(',').append(v).append('\n'));
        byLabel.forEach((k, v) -> sb.append("label,").append(csv(k)).append(',').append(v).append('\n'));

        return sb.toString();
    }

    private static String csv(Object o) {
        if (o == null) return "\"\"";
        String s = String.valueOf(o);
        // escape quotes
        s = s.replace("\"", "\"\"");
        return "\"" + s + "\"";
    }

    // ==============================================================
    // Dashboards
    // ==============================================================

    public Map<String, Object> getSystemDashboard() {
        BigDecimal revenue = orderRepo.sumCompletedAmount();
        long totalAnalyses = analysisRepo.count();

        long queuedJobs = jobRepo.countByStatus("QUEUED");
        long runningJobs = jobRepo.countByStatus("RUNNING");
        long failedJobs = jobRepo.countByStatus("FAILED");

        long totalUsers = userRepo.count();
        long users = userRepo.countByRole(Role.USER);
        long doctors = userRepo.countByRole(Role.DOCTOR);
        long clinics = userRepo.countByRole(Role.CLINIC);

        List<Clinic> pendingClinics = clinicRepo.findByStatus(ClinicStatus.PENDING);

        Map<String, Long> statusDist = new LinkedHashMap<>();
        for (Analysis a : analysisRepo.findAllByOrderByCreatedAtDesc()) {
            String st = a.getStatus() == null ? "" : a.getStatus();
            statusDist.put(st, statusDist.getOrDefault(st, 0L) + 1);
        }

        return Map.of(
                "revenue", revenue,
                "totalAnalyses", totalAnalyses,
                "jobs", Map.of(
                        "queued", queuedJobs,
                        "running", runningJobs,
                        "failed", failedJobs
                ),
                "users", Map.of(
                        "total", totalUsers,
                        "patients", users,
                        "doctors", doctors,
                        "clinics", clinics
                ),
                "pendingClinics", pendingClinics,
                "statusDistribution", statusDist
        );
    }

    public Map<String, Object> getClinicDashboard(User clinicActor) {
        if (clinicActor.getRole() != Role.CLINIC) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a clinic account");
        }
        if (clinicActor.getClinic() == null) {
            return Map.of(
                    "totalAnalyses", 0,
                    "highRisk", 0,
                    "doctors", 0,
                    "recentAnalyses", List.of()
            );
        }
        Long clinicId = clinicActor.getClinic().getId();

        List<Analysis> analyses = analysisRepo.findByUser_Clinic_IdOrderByCreatedAtDesc(clinicId);

        long highRisk = analyses.stream().filter(a -> isHighRisk(a.getPredLabel())).count();
        long doctorCount = userRepo.findByClinic_IdAndRole(clinicId, Role.DOCTOR).size();

        List<Map<String, Object>> recent = analyses.stream().limit(20).map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("analysisId", a.getId());
            m.put("userId", a.getUser() != null ? a.getUser().getId() : null);
            m.put("username", a.getUser() != null ? a.getUser().getUsername() : null);
            m.put("status", a.getStatus());
            m.put("label", a.getPredLabel());
            m.put("confidence", a.getPredConf());
            m.put("createdAt", a.getCreatedAt());
            return m;
        }).toList();

        return Map.of(
                "totalAnalyses", analyses.size(),
                "highRisk", highRisk,
                "doctors", doctorCount,
                "recentAnalyses", recent
        );
    }

    public Map<String, Object> getDoctorDashboard(User doctorActor) {
        if (doctorActor.getRole() != Role.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a doctor account");
        }

        List<User> candidates = userRepo.findByRole(Role.USER);
        List<User> assigned = candidates.stream()
                .filter(u -> u.getAssignedDoctorId() != null && u.getAssignedDoctorId().equals(doctorActor.getId()))
                .toList();
        List<User> patients = assigned.isEmpty() ? candidates : assigned;

        List<Long> ids = patients.stream().map(User::getId).toList();
        List<Analysis> analyses = ids.isEmpty() ? List.of() : analysisRepo.findByUser_IdInOrderByCreatedAtDesc(ids);

        long highRisk = analyses.stream().filter(a -> isHighRisk(a.getPredLabel())).count();
        long pendingReview = analyses.stream().filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus())).count();

        return Map.of(
                "patients", patients.size(),
                "totalAnalyses", analyses.size(),
                "highRisk", highRisk,
                "pendingReview", pendingReview
        );
    }

    private static boolean isHighRisk(String label) {
        String l = (label == null ? "" : label).toLowerCase(Locale.ROOT);
        return l.contains("glau") || l.contains("high") || l.contains("severe") || l.contains("dr");
    }

    // ==============================================================
    // Access control
    // ==============================================================

    private void enforceAccess(User actor, Analysis a) {
        if (actor.getRole() == Role.ADMIN) return;

        User owner = a.getUser();
        if (owner == null) {
            // orphan record: allow only admin/clinic/doctor
            if (actor.getRole() == Role.USER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
            }
            return;
        }

        if (actor.getRole() == Role.USER) {
            if (!Objects.equals(owner.getId(), actor.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
            }
            return;
        }

        if (actor.getRole() == Role.CLINIC) {
            if (actor.getClinic() == null || owner.getClinic() == null
                    || !Objects.equals(actor.getClinic().getId(), owner.getClinic().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
            }
            return;
        }

        if (actor.getRole() == Role.DOCTOR) {
            // If patient has an assigned doctor, enforce it.
            Long assignedDoctorId = owner.getAssignedDoctorId();
            if (assignedDoctorId != null && !Objects.equals(assignedDoctorId, actor.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
            }
        }
    }
}
