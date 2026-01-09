package com.aura.retinal.config;

import io.minio.MinioClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Bean("internalMinioClient")
    public MinioClient internalMinioClient(MinioProperties p) {
        return MinioClient.builder()
                .endpoint(p.getEndpoint())
                .credentials(p.getAccessKey(), p.getSecretKey())
                .region(p.getRegion())
                .build();
    }

    @Bean("publicMinioClient")
    public MinioClient publicMinioClient(MinioProperties p) {
        return MinioClient.builder()
                .endpoint(p.getPublicEndpoint())
                .credentials(p.getAccessKey(), p.getSecretKey())
                .region(p.getRegion())
                .build();
    }
}
