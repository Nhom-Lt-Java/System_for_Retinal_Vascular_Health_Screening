package com.aura.retinal.service;

import com.aura.retinal.entity.AnalysisJob;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionException;

/**
 * Simple DB-backed queue worker.
 * - claim job with SKIP LOCKED
 * - run AI inference in a bounded thread pool
 */
@Component
public class AnalysisWorker {

    private final AnalysisQueueService queue;
    private final AnalysisProcessingService processing;
    private final Executor executor;

    private final boolean enabled;
    private final int concurrency;
    private final int maxAttempts;

    public AnalysisWorker(
            AnalysisQueueService queue,
            AnalysisProcessingService processing,
            @Qualifier("analysisExecutor") Executor executor,
            @Value("${analysis.worker.enabled:true}") boolean enabled,
            @Value("${analysis.worker.concurrency:2}") int concurrency,
            @Value("${analysis.worker.max-attempts:3}") int maxAttempts
    ) {
        this.queue = queue;
        this.processing = processing;
        this.executor = executor;
        this.enabled = enabled;
        this.concurrency = Math.max(1, concurrency);
        this.maxAttempts = Math.max(1, maxAttempts);
    }

    @Scheduled(fixedDelayString = "${analysis.worker.poll-ms:500}")
    public void poll() {
        if (!enabled) return;

        for (int i = 0; i < concurrency; i++) {
            Optional<AnalysisJob> jobOpt = queue.claimNextQueued();
            if (jobOpt.isEmpty()) break;

            Long jobId = jobOpt.get().getId();
            try {
                executor.execute(() -> processing.processJob(jobId, maxAttempts));
            } catch (RejectedExecutionException ex) {
                // If executor is saturated, return the job to queue
                processing.requeue(jobId, "Executor overloaded");
                break;
            }
        }
    }
}
