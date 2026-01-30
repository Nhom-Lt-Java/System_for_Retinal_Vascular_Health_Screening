package com.aura.retinal.service;

import com.aura.retinal.ai.AiClient;
import com.aura.retinal.ai.AiPredictResponse;
import com.aura.retinal.entity.*;
import com.aura.retinal.repository.AnalysisJobRepository;
import com.aura.retinal.repository.AnalysisRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional; // Import Transactional
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AnalysisProcessingService {

    private final AnalysisJobRepository jobRepo;
    private final AnalysisRepository analysisRepo;
    private final FileService fileService;
    private final AiClient aiClient;
    private final BillingService billingService;
    private final NotificationService notificationService;
    private final AiSettingService aiSettingService;
    private final ObjectMapper om = new ObjectMapper();
    private final TransactionTemplate tx;

    public AnalysisProcessingService(
            AnalysisJobRepository jobRepo,
            AnalysisRepository analysisRepo,
            FileService fileService,
            AiClient aiClient,
            BillingService billingService,
            NotificationService notificationService,
            AiSettingService aiSettingService,
            PlatformTransactionManager txManager
    ) {
        this.jobRepo = jobRepo;
        this.analysisRepo = analysisRepo;
        this.fileService = fileService;
        this.aiClient = aiClient;
        this.billingService = billingService;
        this.notificationService = notificationService;
        this.aiSettingService = aiSettingService;
        this.tx = new TransactionTemplate(txManager);
    }

    // --- HÀM XỬ LÝ UPLOAD: Đã thêm @Transactional và Log để debug ---
    @Transactional(rollbackFor = Exception.class)
    public List<Analysis> processBulkUpload(User user, List<MultipartFile> files) {
        System.out.println(">>> START processBulkUpload for user: " + user.getUsername());
        
        // 1. Kiểm tra và trừ tiền (Credit)
        int requiredCredits = files.size();
        boolean paid = billingService.consumeCredits(user.getId(), requiredCredits);
        
        if (!paid) {
            System.err.println(">>> Không đủ tiền: " + user.getUsername());
            throw new RuntimeException("Tài khoản không đủ lượt phân tích. Vui lòng mua thêm gói dịch vụ.");
        }

        List<Analysis> results = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                // 2. Upload File (Dùng hàm upload của FileService như bạn đã cung cấp)
                String originalFilename = file.getOriginalFilename();
                String contentType = file.getContentType();
                if (contentType == null || contentType.isBlank()) contentType = "application/octet-stream";
                
                String objectKey = "uploads/" + UUID.randomUUID() + "-" + originalFilename;
                byte[] fileBytes = file.getBytes();

                System.out.println(">>> Uploading file: " + originalFilename);
                StoredFile storedFile = fileService.upload(objectKey, fileBytes, contentType);

                // 3. Tạo Analysis
                Analysis analysis = new Analysis();
                analysis.setUser(user);
                analysis.setOriginalFile(storedFile);
                analysis.setStatus("QUEUED");
                
                Analysis savedAnalysis = analysisRepo.save(analysis);
                System.out.println(">>> Created Analysis ID: " + savedAnalysis.getId());

                // 4. Tạo Job
                AnalysisJob job = new AnalysisJob();
                job.setAnalysis(savedAnalysis);
                job.setStatus("QUEUED");
                job.setAttempts(0);
                
                jobRepo.save(job);
                System.out.println(">>> Created Job for Analysis ID: " + savedAnalysis.getId());

                results.add(savedAnalysis);

            } catch (Exception e) {
                System.err.println(">>> ERROR processing file: " + file.getOriginalFilename());
                e.printStackTrace();
                // Vì có @Transactional, nếu throw Exception ở đây, toàn bộ transaction (trừ tiền) sẽ rollback.
                throw new RuntimeException("Lỗi khi xử lý file " + file.getOriginalFilename() + ": " + e.getMessage());
            }
        }
        
        System.out.println(">>> END processBulkUpload successfully.");
        return results;
    }

    // --- WORKER LOGIC (Giữ nguyên) ---
    public void processJob(Long jobId, int maxAttempts) {
        JobContext ctx = tx.execute(status -> loadJobContext(jobId));
        if (ctx == null) return;

        if (ctx.attempts() > maxAttempts) {
            markFailed(jobId, "Max attempts reached", true);
            return;
        }

        markAnalysisRunning(ctx.analysisId());

        try {
            if (ctx.originalFileId() == null) {
                throw new IllegalStateException("Missing original file");
            }

            StoredFile original = fileService.get(ctx.originalFileId());
            byte[] bytes = fileService.downloadBytes(original.getId());
            
            String ct = (original.getContentType() == null || original.getContentType().isBlank()) ? "image/jpeg" : original.getContentType();
            String filename = guessFilename(original.getObjectKey(), ct);

            AiPredictResponse ai = aiClient.predict(ctx.analysisId(), bytes, filename, ct);

            applyAiResult(ctx.analysisId(), ai);
            markJobCompleted(jobId);

            if (ctx.userId() != null) {
                notificationService.createFromTemplate(
                        ctx.userId(),
                        "ANALYSIS_DONE",
                        java.util.Map.of("analysisId", ctx.analysisId())
                );
            }

        } catch (Exception ex) {
            String msg = (ex.getMessage() != null) ? ex.getMessage() : ex.getClass().getSimpleName();
            int attempts = tx.execute(status -> {
                AnalysisJob j = jobRepo.findById(jobId).orElse(null);
                return j != null && j.getAttempts() != null ? j.getAttempts() : 1;
            });

            if (attempts >= maxAttempts) {
                markFailed(jobId, msg, true);
            } else {
                requeue(jobId, msg);
            }
        }
    }

    public void requeue(Long jobId, String error) {
        tx.executeWithoutResult(status -> {
            AnalysisJob job = jobRepo.findById(jobId).orElse(null);
            if (job == null) return;
            job.setStatus("QUEUED");
            job.setLastError(error);
            job.setLockedAt(null);
            jobRepo.save(job);

            if (job.getAnalysis() != null) {
                Analysis a = analysisRepo.findById(job.getAnalysis().getId()).orElse(null);
                if (a != null) {
                    a.setStatus("QUEUED");
                    a.setErrorMessage(error);
                    analysisRepo.save(a);
                }
            }
        });
    }

    public void markFailed(Long jobId, String error, boolean refundCredit) {
        tx.executeWithoutResult(status -> {
            AnalysisJob job = jobRepo.findById(jobId).orElse(null);
            if (job == null) return;
            job.setStatus("FAILED");
            job.setLastError(error);
            job.setLockedAt(null);
            jobRepo.save(job);

            if (job.getAnalysis() != null) {
                Analysis a = analysisRepo.findById(job.getAnalysis().getId()).orElse(null);
                if (a != null) {
                    a.setStatus("FAILED");
                    a.setErrorMessage(error);
                    analysisRepo.save(a);

                    if (refundCredit && a.getUser() != null) {
                        billingService.refundCredit(a.getUser().getId());
                    }

                    if (a.getUser() != null) {
                        notificationService.createFromTemplate(
                                a.getUser().getId(),
                                "ANALYSIS_FAILED",
                                java.util.Map.of("analysisId", a.getId(), "error", error)
                        );
                    }
                }
            }
        });
    }

    public void markJobCompleted(Long jobId) {
        tx.executeWithoutResult(status -> {
            AnalysisJob job = jobRepo.findById(jobId).orElse(null);
            if (job == null) return;
            job.setStatus("COMPLETED");
            job.setLastError(null);
            job.setLockedAt(null);
            jobRepo.save(job);
        });
    }

    public void markAnalysisRunning(UUID analysisId) {
        tx.executeWithoutResult(status -> {
            Analysis a = analysisRepo.findById(analysisId).orElse(null);
            if (a == null) return;
            a.setStatus("RUNNING");
            analysisRepo.save(a);
        });
    }

    public void applyAiResult(UUID analysisId, AiPredictResponse ai) {
        tx.executeWithoutResult(status -> {
            Analysis a = analysisRepo.findById(analysisId).orElseThrow();

            a.setPredLabel(ai.pred_label());
            a.setPredConf(ai.pred_conf());
            a.setProbsJson(ai.probs());

            String risk = computeRiskLevel(ai.pred_label(), ai.pred_conf());
            a.setRiskLevel(risk);
            a.setAdviceJson(om.valueToTree(defaultAdvice(risk, ai.pred_label())));
            a.setStatus("COMPLETED");
            a.setErrorMessage(null);

            a.setAiVersion(aiSettingService.getModelVersionOrDefault("0.1.0"));
            ObjectNode thresholds = om.createObjectNode();
            thresholds.put("vessel_threshold", ai.vessel_threshold());
            a.setThresholdsJson(thresholds);

            AiPredictResponse.Artifacts art = ai.artifacts();
            if (art != null) {
                String png = "image/png";
                if (notBlank(art.overlay_key())) {
                    a.setOverlayFile(fileService.register(art.overlay_key(), png, art.overlay_size()));
                }
                if (notBlank(art.mask_key())) {
                    a.setMaskFile(fileService.register(art.mask_key(), png, art.mask_size()));
                }
                if (notBlank(art.heatmap_key())) {
                    a.setHeatmapFile(fileService.register(art.heatmap_key(), png, art.heatmap_size()));
                }
                if (notBlank(art.heatmap_overlay_key())) {
                    a.setHeatmapOverlayFile(fileService.register(art.heatmap_overlay_key(), png, art.heatmap_overlay_size()));
                }
            }

            analysisRepo.save(a);

            if (a.getUser() != null && a.getUser().getAssignedDoctorId() != null && "HIGH".equalsIgnoreCase(a.getRiskLevel())) {
                notificationService.createFromTemplate(
                        a.getUser().getAssignedDoctorId(),
                        "HIGH_RISK_ALERT",
                        java.util.Map.of(
                                "patientId", a.getUser().getId(),
                                "analysisId", a.getId()
                        )
                );
            }
        });
    }

    private String computeRiskLevel(String label, Double conf) {
        String l = label == null ? "" : label.toLowerCase();
        double c = conf == null ? 0.0 : conf;
        if (c < 0.45) return "QUALITY_LOW";
        if (l.contains("glau") || l.contains("stroke") || l.contains("occlusion") || l.contains("rvo")) return "HIGH";
        if (l.contains("dr") || l.contains("diab") || l.contains("amd") || l.contains("htn") || l.contains("hyper")) return "MED";
        if (l.contains("normal") || l.contains("healthy")) return "LOW";
        return c >= 0.7 ? "MED" : "QUALITY_LOW";
    }

    private java.util.List<String> defaultAdvice(String riskLevel, String label) {
        String l = label == null ? "" : label.toUpperCase();
        return switch (riskLevel == null ? "" : riskLevel.toUpperCase()) {
            case "HIGH" -> java.util.List.of(
                    "Nguy cơ cao: nên liên hệ bác sĩ/CSYT sớm để được khám và xác nhận.",
                    "Mang theo kết quả và tiền sử bệnh (huyết áp, đường huyết, tim mạch nếu có).",
                    "Nếu có triệu chứng giảm thị lực đột ngột/đau mắt/nhức đầu, đi cấp cứu ngay."
            );
            case "MED" -> java.util.List.of(
                    "Có dấu hiệu bất thường: nên đặt lịch khám chuyên khoa mắt trong 1–2 tuần.",
                    "Theo dõi và kiểm soát các yếu tố nguy cơ (đường huyết, huyết áp, mỡ máu).",
                    "Tái khám định kỳ và chụp lại võng mạc theo hướng dẫn bác sĩ."
            );
            case "LOW" -> java.util.List.of(
                    "Kết quả gợi ý nguy cơ thấp.",
                    "Duy trì lối sống lành mạnh và kiểm tra mắt định kỳ 6–12 tháng/lần.",
                    "Nếu có bệnh nền (đái tháo đường, tăng huyết áp), vẫn cần theo dõi theo phác đồ."
            );
            default -> java.util.List.of(
                    "Chất lượng/độ tin cậy chưa cao. Vui lòng chụp lại ảnh (đủ sáng, không rung, không lóe).",
                    "Nếu triệu chứng bất thường, hãy đi khám bác sĩ để được đánh giá."
            );
        };
    }

    private JobContext loadJobContext(Long jobId) {
        AnalysisJob job = jobRepo.findById(jobId).orElse(null);
        if (job == null) return null;
        UUID analysisId = job.getAnalysis() != null ? job.getAnalysis().getId() : null;
        Long userId = (job.getAnalysis() != null && job.getAnalysis().getUser() != null) ? job.getAnalysis().getUser().getId() : null;
        UUID originalFileId = (job.getAnalysis() != null && job.getAnalysis().getOriginalFile() != null) ? job.getAnalysis().getOriginalFile().getId() : null;
        int attempts = job.getAttempts() != null ? job.getAttempts() : 0;
        if (analysisId == null) return null;
        return new JobContext(job.getId(), analysisId, userId, originalFileId, attempts);
    }

    private record JobContext(Long jobId, UUID analysisId, Long userId, UUID originalFileId, int attempts) {}

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static String guessFilename(String objectKey, String contentType) {
        if (objectKey != null && objectKey.contains("/")) {
            String name = objectKey.substring(objectKey.lastIndexOf('/') + 1);
            if (!name.isBlank()) return name;
        }
        if (contentType != null && contentType.toLowerCase().contains("png")) return "upload.png";
        return "upload.jpg";
    }
}