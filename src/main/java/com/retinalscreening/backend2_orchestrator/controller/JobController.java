package com.retinalscreening.backend2_orchestrator.controller;

import com.retinalscreening.backend2_orchestrator.entity.AnalysisJob;
import com.retinalscreening.backend2_orchestrator.repository.AnalysisJobRepository;
import com.retinalscreening.backend2_orchestrator.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*") 
public class JobController {

    @Autowired
    private AnalysisJobRepository jobRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    // FR-2: Upload ảnh & Tạo Job
    @PostMapping("/upload")
    public ResponseEntity<?> uploadJob(@RequestParam("file") MultipartFile file,
                                       @RequestParam("userId") UUID userId) {
        try {
            String imageUrl = cloudinaryService.uploadImage(file);
            AnalysisJob job = new AnalysisJob();
            job.setUserId(userId);
            job.setImageUrl(imageUrl);
            job.setStatus("PENDING"); // Đang chờ AI xử lý
            job.setCreatedAt(LocalDateTime.now());
            return ResponseEntity.ok(jobRepository.save(job));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Lỗi upload: " + e.getMessage());
        }
    }

    // FR-6/17: Xem chi tiết Job
    @GetMapping("/{id}")
    public ResponseEntity<?> getJob(@PathVariable UUID id) {
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // FR-3: Giả lập AI trả kết quả về (Internal API)
    @PutMapping("/{id}/ai-result")
    public ResponseEntity<?> receiveAiResult(@PathVariable UUID id, @RequestBody Map<String, String> aiResult) {
        return jobRepository.findById(id).map(job -> {
            // Cập nhật kết quả từ AI
            job.setAiRiskLevel(aiResult.get("risk")); // Ví dụ: HIGH, MEDIUM
            job.setAiFindings(aiResult.get("findings")); // Ví dụ: "Phát hiện đốm xuất huyết"
            
            // Logic FR-29: Cảnh báo nguy cơ cao
            if ("HIGH".equalsIgnoreCase(aiResult.get("risk"))) {
                System.out.println("⚠️ CẢNH BÁO: Bệnh nhân " + job.getUserId() + " có nguy cơ cao!");
                // Sau này sẽ bắn Notification ở đây
            }

            job.setStatus("AI_DONE"); // AI đã xong, chờ bác sĩ duyệt
            return ResponseEntity.ok(jobRepository.save(job));
        }).orElse(ResponseEntity.notFound().build());
    }

    // FR-15 & FR-16: Bác sĩ xác nhận và ghi chú
    @PutMapping("/{id}/doctor-confirm")
    public ResponseEntity<?> doctorConfirm(@PathVariable UUID id, @RequestBody Map<String, String> doctorInput) {
        return jobRepository.findById(id).map(job -> {
            job.setDoctorNotes(doctorInput.get("notes"));
            job.setFinalDiagnosis(doctorInput.get("diagnosis")); // Ví dụ: "Bệnh võng mạc tiểu đường giai đoạn 2"
            job.setConfirmedAt(LocalDateTime.now());
            job.setStatus("COMPLETED"); // Hoàn tất quy trình
            return ResponseEntity.ok(jobRepository.save(job));
        }).orElse(ResponseEntity.notFound().build());
    }
}