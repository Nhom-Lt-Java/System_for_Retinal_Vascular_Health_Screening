package com.aura.retinal.service;

import com.aura.retinal.dto.AnalysisResponse;
import com.aura.retinal.entity.Analysis;
import com.aura.retinal.entity.StoredFile;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.AnalysisRepository;
import com.aura.retinal.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AnalysisService {

    private final FileService fileService;
    private final AnalysisRepository analysisRepo;
    private final UserRepository userRepo;
    private final AnalysisQueueService queue;
    private final BillingService billing;
    private final ObjectMapper om = new ObjectMapper();

    public AnalysisService(FileService fileService,
                           AnalysisRepository analysisRepo,
                           UserRepository userRepo,
                           AnalysisQueueService queue,
                           BillingService billing) {
        this.fileService = fileService;
        this.analysisRepo = analysisRepo;
        this.userRepo = userRepo;
        this.queue = queue;
        this.billing = billing;
    }

    @Transactional
    public AnalysisResponse submit(byte[] originalBytes,
                                   String filename,
                                   String contentType,
                                   Long userId) {

        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing userId");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Consume 1 credit (Mode 1: demo payment but write DB credit)
        billing.consumeCredits(userId, 1);
        return submitInternal(originalBytes, filename, contentType, user);
    }

    @Transactional
    public List<AnalysisResponse> submitBulk(List<FilePayload> files, Long userId) {
        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No files");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // NFR-2: bulk processing >=100 (queue) - reserve all credits upfront
        billing.consumeCredits(userId, files.size());

        return files.stream()
                .map(fp -> submitInternal(fp.bytes(), fp.filename(), fp.contentType(), user))
                .toList();
    }

    private AnalysisResponse submitInternal(byte[] originalBytes,
                                           String filename,
                                           String contentType,
                                           User user) {
        UUID analysisId = UUID.randomUUID();
        String safeName = (filename == null || filename.isBlank()) ? "upload" : filename;
        String ct = (contentType == null || contentType.isBlank()) ? "image/jpeg" : contentType;

        String originalKey = "analyses/%s/original_%s".formatted(analysisId, safeName.replaceAll("[^a-zA-Z0-9._-]", "_"));
        StoredFile original = fileService.upload(originalKey, originalBytes, ct);

        Analysis a = new Analysis();
        a.setId(analysisId);
        a.setUser(user);
        a.setStatus("QUEUED");
        a.setOriginalFile(original);
        a.setCreatedAt(Instant.now());
        a.setUpdatedAt(Instant.now());
        analysisRepo.save(a);

        // Create job
        queue.enqueue(a);

        return toResponse(a);
    }

    public List<AnalysisResponse> listByUser(Long userId) {
        return analysisRepo.findByUser_IdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    public AnalysisResponse get(UUID analysisId) {
        return toResponse(analysisRepo.findById(analysisId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Analysis not found")));
    }

    public AnalysisResponse toResponse(Analysis a) {
        String originalUrl = a.getOriginalFile() != null ? fileService.presignedUrl(a.getOriginalFile().getId()) : null;
        String overlayUrl = a.getOverlayFile() != null ? fileService.presignedUrl(a.getOverlayFile().getId()) : null;
        String maskUrl = a.getMaskFile() != null ? fileService.presignedUrl(a.getMaskFile().getId()) : null;
        String heatmapUrl = a.getHeatmapFile() != null ? fileService.presignedUrl(a.getHeatmapFile().getId()) : null;
        String heatmapOverlayUrl = a.getHeatmapOverlayFile() != null ? fileService.presignedUrl(a.getHeatmapOverlayFile().getId()) : null;

        var thresholds = a.getThresholdsJson() != null ? a.getThresholdsJson() : om.createObjectNode();

        // advice: store as jsonb array -> return as List<String> for FE
        java.util.List<String> advice = java.util.List.of();
        try {
            if (a.getAdviceJson() != null && a.getAdviceJson().isArray()) {
                advice = om.convertValue(a.getAdviceJson(), om.getTypeFactory().constructCollectionType(java.util.List.class, String.class));
            }
        } catch (Exception ignored) {
        }

        return new AnalysisResponse(
                a.getId(),
                a.getStatus(),
                a.getPredLabel(),
                a.getPredConf(),
                a.getProbsJson(),
                a.getRiskLevel(),
                advice,
                originalUrl,
                overlayUrl,
                maskUrl,
                heatmapUrl,
                heatmapOverlayUrl,
                a.getDoctorConclusion(),
                a.getDoctorNote(),
                a.getReviewedAt(),
                a.getReviewedBy() != null ? a.getReviewedBy().getId() : null,
                a.getAiVersion(),
                thresholds,
                a.getErrorMessage(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }

    /** Simple in-memory payload for bulk upload to keep controller clean. */
    public record FilePayload(byte[] bytes, String filename, String contentType) {}
}
