package com.aura.retinal.controller;

import com.aura.retinal.dto.AnalysisResponse;
import com.aura.retinal.dto.doctor.DoctorReviewRequest;
import com.aura.retinal.entity.Analysis;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.AnalysisRepository;
import com.aura.retinal.service.AnalysisProcessingService;
import com.aura.retinal.service.FileService;
import com.aura.retinal.service.UserContextService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analyses")
public class AnalysisController {

    @Autowired private AnalysisRepository analysisRepo;
    @Autowired private UserContextService userContext;
    @Autowired private AnalysisProcessingService processingService;
    @Autowired private FileService fileService;
    
    private final ObjectMapper mapper = new ObjectMapper();

    // 1. API: Upload & Phân tích (Bulk) - Cho User/Clinic
    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('CLINIC')")
    public ResponseEntity<?> analyzeImages(
            @RequestParam("files") List<MultipartFile> files,
            Authentication auth) {
        
        User user = userContext.requireUser(auth);
        try {
            List<Analysis> analyses = processingService.processBulkUpload(user, files);
            List<AnalysisResponse> responses = analyses.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // 2. API: Lấy danh sách lịch sử của tôi (User)
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnalysisResponse>> getMyAnalyses(Authentication auth) {
        User user = userContext.requireUser(auth);
        List<Analysis> analyses = analysisRepo.findByUser_IdOrderByCreatedAtDesc(user.getId());
        
        List<AnalysisResponse> responses = analyses.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // 3. API: Xem chi tiết 1 kết quả (Chung cho tất cả)
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnalysisResponse> getAnalysis(@PathVariable UUID id, Authentication auth) {
        User actor = userContext.requireUser(auth);
        
        Analysis analysis = analysisRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy kết quả"));

        checkAccess(actor, analysis);

        return ResponseEntity.ok(convertToResponse(analysis));
    }

    // --- 4. API MỚI: Bác sĩ lấy danh sách bệnh nhân được phân công ---
    @GetMapping("/doctor/assigned")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AnalysisResponse>> getAssignedAnalyses(Authentication auth) {
        User doctor = userContext.requireUser(auth);
        
        // Tìm các analysis mà user sở hữu có assignedDoctorId trùng với ID bác sĩ đang login
        List<Analysis> list = analysisRepo.findByUser_AssignedDoctorIdOrderByCreatedAtDesc(doctor.getId());
        
        List<AnalysisResponse> responses = list.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // --- 5. API MỚI: Bác sĩ gửi đánh giá/kết luận ---
    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AnalysisResponse> submitDoctorReview(
            @PathVariable UUID id,
            @RequestBody DoctorReviewRequest request,
            Authentication auth) {
        
        User doctor = userContext.requireUser(auth);
        Analysis analysis = analysisRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy kết quả"));

        // Kiểm tra quyền: Bác sĩ này có được phân công cho bệnh nhân này không?
        if (analysis.getUser() != null && !doctor.getId().equals(analysis.getUser().getAssignedDoctorId())) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không được phân công hồ sơ này");
        }

        // Cập nhật thông tin đánh giá
        analysis.setDoctorConclusion(request.conclusion());
        analysis.setDoctorAdvice(request.advice());
        analysis.setDoctorNote(request.note());
        analysis.setReviewResult(request.reviewResult()); // APPROVED / CORRECTED
        
        // Nếu bác sĩ sửa nhãn bệnh, có thể lưu vào đây (nếu có trường tương ứng)
        // analysis.setCorrectedLabel(request.correctedLabel()); 

        // Cập nhật trạng thái
        analysis.setStatus("REVIEWED");
        analysis.setReviewedBy(doctor);
        analysis.setReviewedAt(Instant.now());

        Analysis saved = analysisRepo.save(analysis);
        return ResponseEntity.ok(convertToResponse(saved));
    }

    // --- Helper Functions ---

    private AnalysisResponse convertToResponse(Analysis a) {
        String originalUrl = (a.getOriginalFile() != null) ? fileService.presignedUrl(a.getOriginalFile().getId()) : null;
        String overlayUrl = (a.getOverlayFile() != null) ? fileService.presignedUrl(a.getOverlayFile().getId()) : null;
        String maskUrl = (a.getMaskFile() != null) ? fileService.presignedUrl(a.getMaskFile().getId()) : null;
        String heatmapUrl = (a.getHeatmapFile() != null) ? fileService.presignedUrl(a.getHeatmapFile().getId()) : null;
        String heatmapOverlayUrl = (a.getHeatmapOverlayFile() != null) ? fileService.presignedUrl(a.getHeatmapOverlayFile().getId()) : null;

        List<String> adviceList = Collections.emptyList();
        if (a.getAdviceJson() != null) {
            try {
                adviceList = mapper.convertValue(a.getAdviceJson(), new TypeReference<List<String>>() {});
            } catch (Exception e) {}
        }

        return new AnalysisResponse(
                a.getId(),
                a.getStatus(),
                a.getPredLabel(),
                a.getPredConf(),
                a.getProbsJson(),
                a.getRiskLevel(),
                adviceList,
                originalUrl,
                overlayUrl,
                maskUrl,
                heatmapUrl,
                heatmapOverlayUrl,
                a.getDoctorConclusion(),
                a.getDoctorNote(),
                a.getReviewedAt(),
                (a.getReviewedBy() != null) ? a.getReviewedBy().getId() : null,
                a.getAiVersion(),
                a.getThresholdsJson(),
                a.getErrorMessage(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
    
    private void checkAccess(User actor, Analysis analysis) {
        if (actor.getRole() == Role.ADMIN) return;
        if (analysis.getUser() != null && analysis.getUser().getId().equals(actor.getId())) return;
        
        if (actor.getRole() == Role.DOCTOR) {
            if (analysis.getUser() != null && analysis.getUser().getAssignedDoctorId() != null 
                && analysis.getUser().getAssignedDoctorId().equals(actor.getId())) return;
        }
        
        if (actor.getRole() == Role.CLINIC && actor.getClinic() != null) {
            if (analysis.getUser() != null && analysis.getUser().getClinic() != null
                && analysis.getUser().getClinic().getId().equals(actor.getClinic().getId())) return;
        }
        
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem kết quả này");
    }
}