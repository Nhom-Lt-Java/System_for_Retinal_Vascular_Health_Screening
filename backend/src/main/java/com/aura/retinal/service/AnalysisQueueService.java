package com.aura.retinal.service;

import com.aura.retinal.entity.Analysis;
import com.aura.retinal.entity.AnalysisJob;
import com.aura.retinal.repository.AnalysisJobRepository;
import com.aura.retinal.repository.AnalysisRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class AnalysisQueueService {

    private final AnalysisJobRepository jobRepo;
    private final AnalysisRepository analysisRepo;

    public AnalysisQueueService(AnalysisJobRepository jobRepo, AnalysisRepository analysisRepo) {
        this.jobRepo = jobRepo;
        this.analysisRepo = analysisRepo;
    }

    @Transactional
    public AnalysisJob enqueue(Analysis analysis) {
        // Ensure analysis exists
        if (!analysisRepo.existsById(analysis.getId())) {
            analysisRepo.save(analysis);
        }
        AnalysisJob job = new AnalysisJob();
        job.setAnalysis(analysis);
        job.setStatus("QUEUED");
        job.setAttempts(0);
        job.setLockedAt(null);
        job.setLastError(null);
        job.setCreatedAt(Instant.now());
        job.setUpdatedAt(Instant.now());
        return jobRepo.save(job);
    }

    /**
     * Claim next queued job using FOR UPDATE SKIP LOCKED.
     * Must be called inside a transaction.
     */
    @Transactional
    public Optional<AnalysisJob> claimNextQueued() {
        Optional<AnalysisJob> opt = jobRepo.lockNextQueued();
        if (opt.isEmpty()) return Optional.empty();

        AnalysisJob job = opt.get();
        job.setStatus("RUNNING");
        job.setLockedAt(Instant.now());
        job.setAttempts(job.getAttempts() == null ? 1 : job.getAttempts() + 1);
        job.setUpdatedAt(Instant.now());
        return Optional.of(jobRepo.save(job));
    }
}
