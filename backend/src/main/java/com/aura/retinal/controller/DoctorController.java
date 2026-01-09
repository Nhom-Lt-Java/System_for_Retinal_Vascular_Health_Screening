package com.aura.retinal.controller;

import com.aura.retinal.dto.doctor.PatientSummaryResponse;
import com.aura.retinal.dto.doctor.RecentAnalysisResponse;
import com.aura.retinal.entity.Analysis;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.AnalysisRepository;
import com.aura.retinal.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    private final UserRepository userRepo;
    private final AnalysisRepository analysisRepo;

    public DoctorController(UserRepository userRepo, AnalysisRepository analysisRepo) {
        this.userRepo = userRepo;
        this.analysisRepo = analysisRepo;
    }

    // Danh sách bệnh nhân (role USER) + kết quả gần nhất
    @GetMapping("/patients")
    public List<PatientSummaryResponse> listPatients() {
        List<User> patients = userRepo.findByRole(Role.USER);

        return patients.stream()
                .sorted(Comparator.comparing(User::getId)) // ổn định cho demo
                .map(u -> {
                    Analysis last = analysisRepo.findTop1ByUser_IdOrderByCreatedAtDesc(u.getId()).orElse(null);
                    if (last == null) {
                        return new PatientSummaryResponse(
                                u.getId(),
                                u.getUsername(),
                                null,
                                null,
                                null,
                                null,
                                null
                        );
                    }
                    return new PatientSummaryResponse(
                            u.getId(),
                            u.getUsername(),
                            last.getId(),
                            last.getStatus(),
                            last.getPredLabel(),
                            last.getPredConf(),
                            last.getCreatedAt()
                    );
                })
                .toList();
    }

    // Top 20 analyses gần nhất
    @GetMapping("/recent-analyses")
    public List<RecentAnalysisResponse> recentAnalyses() {
        return analysisRepo.findTop20ByOrderByCreatedAtDesc().stream()
                .map(a -> new RecentAnalysisResponse(
                        a.getId(),
                        a.getUser() != null ? a.getUser().getId() : null,
                        a.getUser() != null ? a.getUser().getUsername() : null,
                        a.getStatus(),
                        a.getPredLabel(),
                        a.getPredConf(),
                        a.getCreatedAt()
                ))
                .toList();
    }

    // (tuỳ chọn) lịch sử theo 1 bệnh nhân
    @GetMapping("/patients/{patientId}/analyses")
    public List<RecentAnalysisResponse> analysesByPatient(@PathVariable Long patientId) {
        return analysisRepo.findByUser_IdOrderByCreatedAtDesc(patientId).stream()
                .map(a -> new RecentAnalysisResponse(
                        a.getId(),
                        patientId,
                        a.getUser() != null ? a.getUser().getUsername() : null,
                        a.getStatus(),
                        a.getPredLabel(),
                        a.getPredConf(),
                        a.getCreatedAt()
                ))
                .toList();
    }
}
