package com.aura.retinal.service;

import com.aura.retinal.ai.AiClient;
import com.aura.retinal.ai.AiPredictResponse;
import com.aura.retinal.dto.AnalysisResponse;
import com.aura.retinal.entity.Analysis;
import com.aura.retinal.entity.StoredFile;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.AnalysisRepository;
import com.aura.retinal.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AnalysisService {

    private final AiClient aiClient;
    private final FileService fileService;
    private final AnalysisRepository analysisRepo;
    private final UserRepository userRepo;

    public AnalysisService(AiClient aiClient, FileService fileService, AnalysisRepository analysisRepo, UserRepository userRepo) {
        this.aiClient = aiClient;
        this.fileService = fileService;
        this.analysisRepo = analysisRepo;
        this.userRepo = userRepo;
    }

    public AnalysisResponse create(byte[] originalBytes, String filename, String contentType, Long userId) throws Exception {
        UUID analysisId = UUID.randomUUID();

        String safeFilename = (filename == null || filename.isBlank()) ? "upload.jpg" : filename;
        String safeContentType = (contentType == null || contentType.isBlank()) ? "image/jpeg" : contentType;

        // 1) Upload ảnh gốc lên MinIO + lưu stored_files
        String ext = extFromContentType(safeContentType);
        String objectKey = "analyses/" + analysisId + "/original." + ext;
        StoredFile originalFile = fileService.upload(objectKey, originalBytes, safeContentType);

        // 2) Tạo Analysis (PENDING)
        Analysis a = new Analysis();
        a.setId(analysisId);
        a.setStatus("PENDING");
        a.setOriginalFile(originalFile);

        if (userId != null) {
            User u = userRepo.findById(userId).orElseThrow();
            a.setUser(u);
        }

        analysisRepo.save(a);

        // 3) Gọi AI
        AiPredictResponse ai = aiClient.predict(analysisId, originalBytes, safeFilename, safeContentType);

        // 4) Update kết quả vào Analysis
        a.setStatus("COMPLETED"); // hoặc "DONE" nếu FE của bạn đang dùng DONE
        a.setPredLabel(ai.pred_label());
        a.setPredConf(ai.pred_conf());
        a.setProbsJson(ai.probs());

        // 5) Register artifacts (AI core đã upload rồi => backend chỉ register key)
        AiPredictResponse.Artifacts art = ai.artifacts();
        if (art != null) {
            // Mặc định artifacts là PNG (bạn có thể đổi nếu AI trả loại khác)
            String png = "image/png";

            if (notBlank(art.overlay_key())) {
                StoredFile f = fileService.register(art.overlay_key(), png, art.overlay_size());
                a.setOverlayFile(f);
            }
            if (notBlank(art.mask_key())) {
                StoredFile f = fileService.register(art.mask_key(), png, art.mask_size());
                a.setMaskFile(f);
            }
            if (notBlank(art.heatmap_key())) {
                StoredFile f = fileService.register(art.heatmap_key(), png, art.heatmap_size());
                a.setHeatmapFile(f);
            }
            if (notBlank(art.heatmap_overlay_key())) {
                StoredFile f = fileService.register(art.heatmap_overlay_key(), png, art.heatmap_overlay_size());
                a.setHeatmapOverlayFile(f);
            }
        }

        analysisRepo.save(a);

        return toResponse(a);
    }

    public AnalysisResponse get(UUID id) {
        Analysis a = analysisRepo.findById(id).orElseThrow();
        return toResponse(a);
    }

    public List<AnalysisResponse> listByUserId(Long userId) {
        return analysisRepo.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AnalysisResponse toResponse(Analysis a) {
        String originalUrl = (a.getOriginalFile() != null) ? fileService.presignedUrl(a.getOriginalFile().getId()) : null;
        String overlayUrl = (a.getOverlayFile() != null) ? fileService.presignedUrl(a.getOverlayFile().getId()) : null;
        String maskUrl = (a.getMaskFile() != null) ? fileService.presignedUrl(a.getMaskFile().getId()) : null;
        String heatUrl = (a.getHeatmapFile() != null) ? fileService.presignedUrl(a.getHeatmapFile().getId()) : null;
        String heatOvUrl = (a.getHeatmapOverlayFile() != null) ? fileService.presignedUrl(a.getHeatmapOverlayFile().getId()) : null;

        double predConf = (a.getPredConf() != null) ? a.getPredConf() : 0.0;

        return new AnalysisResponse(
                a.getId(),
                a.getStatus(),
                a.getPredLabel(),
                predConf,
                a.getProbsJson(),
                originalUrl,
                overlayUrl,
                maskUrl,
                heatUrl,
                heatOvUrl,
                a.getCreatedAt()
        );
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static String extFromContentType(String contentType) {
        String ct = contentType.toLowerCase();
        if (ct.contains("png")) return "png";
        if (ct.contains("jpeg") || ct.contains("jpg")) return "jpg";
        return "bin";
    }
}
