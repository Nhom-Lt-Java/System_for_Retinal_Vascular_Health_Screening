package com.aura.retinal.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AnalysisWorkerConfig {

    @Bean(name = "analysisExecutor")
    public Executor analysisExecutor(
            @Value("${analysis.worker.concurrency:2}") int concurrency
    ) {
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(Math.max(1, concurrency));
        ex.setMaxPoolSize(Math.max(1, concurrency));
        ex.setQueueCapacity(concurrency * 50);
        ex.setThreadNamePrefix("analysis-worker-");
        ex.initialize();
        return ex;
    }
}
