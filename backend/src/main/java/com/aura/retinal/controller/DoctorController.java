package com.aura.retinal.controller;

import com.aura.retinal.dto.AnalysisResponse;
import com.aura.retinal.dto.doctor.DoctorReviewRequest;
import com.aura.retinal.dto.doctor.PatientSummaryResponse;
import com.aura.retinal.entity.*;
import com.aura.retinal.repository.*;
import com.aura.retinal.service.AnalysisService;
import com.aura.retinal.service.NotificationService;
import com.aura.retinal.service.UserContextService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final UserContextService userContext;
    private final UserRepository userRepo;
    private final AnalysisRepository analysisRepo;
    private final AnalysisService analysisService;
    private final AnalysisFeedbackRepository feedbackRepo;
    private final NotificationService notificationService;

    public DoctorController(UserContextService userContext,
                            UserRepository userRepo,
                            AnalysisRepository analysisRepo,
                            AnalysisService analysisService,
                            AnalysisFeedbackRepository feedbackRepo,
                            NotificationService notificationService) {
        this.userContext = userContext;
        this.userRepo = userRepo;
        this.analysisRepo = analysisRepo;
        this.analysisService = analysisService;
        this.feedbackRepo = feedbackRepo;
        this.notificationService = notificationService;
    }

    @GetMapping("/patients")
    public List<PatientSummaryResponse> listPatients(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "risk", required = false) String risk,
            Authentication auth
    ) {
        User doctor = userContext.requireUser(auth);

        List<User> candidates = userRepo.findByRole(Role.USER);

        // Prefer assigned patients (if any exist)
        List<User> assigned = candidates.stream()
                .filter(u -> u.getAssignedDoctorId() != null && u.getAssignedDoctorId().equals(doctor.getId()))
                .toList();
        List<User> patients = assigned.isEmpty() ? candidates : assigned;

        String query = q == null ? "" : q.toLowerCase();
        String riskLower = risk == null ? "" : risk.toLowerCase();

        return patients.stream()
                .filter(u -> query.isBlank() || (u.getUsername() != null && u.getUsername().toLowerCase().contains(query))
                        || (u.getFullName() != null && u.getFullName().toLowerCase().contains(query)))
                .map(u -> {
                    Optional<Analysis> latest = analysisRepo.findTop1ByUser_IdOrderByCreatedAtDesc(u.getId());
                    if (latest.isPresent()) {
                        Analysis a = latest.get();
                        if (!riskLower.isBlank()) {
                            String label = a.getPredLabel() == null ? "" : a.getPredLabel().toLowerCase();
                            if (!label.contains(riskLower)) {
                                return null;
                            }
                        }
                        return new PatientSummaryResponse(
                                u.getId(),
                                u.getUsername(),
                                a.getId(),
                                a.getStatus(),
                                a.getPredLabel(),
                                a.getPredConf(),
                                a.getCreatedAt()
                        );
                    }
                    if (!riskLower.isBlank()) return null;
                    return new PatientSummaryResponse(u.getId(), u.getUsername(), null, null, null, null, null);
                })
                .filter(r -> r != null)
                .toList();
    }

    @GetMapping("/patients/{patientId}/analyses")
    public List<AnalysisResponse> patientAnalyses(@PathVariable Long patientId, Authentication auth) {
        User doctor = userContext.requireUser(auth);
        User patient = userRepo.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        // If patient has assigned doctor, enforce it
        if (patient.getAssignedDoctorId() != null && !patient.getAssignedDoctorId().equals(doctor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not assigned to this patient");
        }

        return analysisService.listByUser(patientId);
    }

    @PostMapping("/analyses/{analysisId}/review")
    public AnalysisResponse review(@PathVariable UUID analysisId,
                                   @Valid @RequestBody DoctorReviewRequest req,
                                   Authentication auth) {
        User doctor = userContext.requireUser(auth);
        Analysis a = analysisRepo.findById(analysisId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Analysis not found"));

        // Enforce assignment if exists
        if (a.getUser() != null && a.getUser().getAssignedDoctorId() != null
                && !a.getUser().getAssignedDoctorId().equals(doctor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not assigned to this patient");
        }

        a.setDoctorConclusion(req.conclusion());
        a.setDoctorNote(req.note());
        a.setReviewedBy(doctor);
        a.setReviewedAt(Instant.now());
        a.setStatus("REVIEWED");
        if (req.correctedLabel() != null && !req.correctedLabel().isBlank()) {
            a.setPredLabel(req.correctedLabel());
        }
        analysisRepo.save(a);

        // Feedback for retraining
        AnalysisFeedback fb = new AnalysisFeedback();
        fb.setAnalysis(a);
        fb.setDoctor(doctor);
        fb.setCorrectedLabel(req.correctedLabel());
        fb.setNote(req.note());
        feedbackRepo.save(fb);

        if (a.getUser() != null) {
            notificationService.createNotification(
                    a.getUser().getId(),
                    "Bác sĩ đã duyệt kết quả",
                    "Phân tích " + a.getId() + " đã được bác sĩ duyệt.",
                    "REVIEW"
            );
        }

        return analysisService.get(a.getId());
    }


    /**
     * Trend data for doctor: daily counts by riskLevel for assigned patients.
     * GET /api/doctor/trends?days=30
     */
    @GetMapping("/trends")
    @PreAuthorize("hasRole('DOCTOR')")
    public Map<String, Object> trends(Authentication auth, @RequestParam(defaultValue = "30") int days) {
        User doctor = userContext.requireUser(auth);
        if (days < 1) days = 1;
        if (days > 180) days = 180;

        List<User> patients = userRepo.findByAssignedDoctor_Id(doctor.getId());
        List<Long> patientIds = patients.stream().map(User::getId).toList();

        LocalDate from = LocalDate.now().minusDays(days - 1);
        Map<LocalDate, Map<String, Integer>> daily = new LinkedHashMap<>();
        for (int i = 0; i < days; i++) {
            LocalDate d = from.plusDays(i);
            daily.put(d, new LinkedHashMap<>(Map.of("LOW", 0, "MED", 0, "HIGH", 0, "QUALITY_LOW", 0)));
        }

        if (!patientIds.isEmpty()) {
            List<Analysis> analyses = analysisRepo.findByUser_IdInOrderByCreatedAtDesc(patientIds);
            for (Analysis a : analyses) {
                if (a.getCreatedAt() == null) continue;
                LocalDate d = a.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate();
                if (d.isBefore(from) || d.isAfter(LocalDate.now())) continue;
                String r = a.getRiskLevel() == null ? "QUALITY_LOW" : a.getRiskLevel().toUpperCase();
                if (!daily.containsKey(d)) continue;
                Map<String, Integer> m = daily.get(d);
                if (!m.containsKey(r)) r = "QUALITY_LOW";
                m.put(r, m.get(r) + 1);
            }
        }

        List<Map<String, Object>> series = daily.entrySet().stream()
                .map(e -> Map.<String, Object>of(
                        "date", e.getKey().toString(),
                        "LOW", e.getValue().get("LOW"),
                        "MED", e.getValue().get("MED"),
                        "HIGH", e.getValue().get("HIGH"),
                        "QUALITY_LOW", e.getValue().get("QUALITY_LOW")
                ))
                .toList();

        return Map.of(
                "doctorId", doctor.getId(),
                "days", days,
                "series", series
        );
    }
}
