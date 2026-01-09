package com.aura.retinal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "minio")
public class MinioProperties {
    private String accessKey;
    private String secretKey;

    // internal: dùng trong docker network (backend -> minio)
    private String endpoint = "http://minio:9000";

    // public: trả về cho browser (frontend tải ảnh)
    private String publicEndpoint = "http://localhost:9000";

    private String bucket = "aura";
    private int presignExpirySeconds = 600;

    // ✅ để presign offline
    private String region = "us-east-1";

    public String getAccessKey() { return accessKey; }
    public void setAccessKey(String accessKey) { this.accessKey = accessKey; }

    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public String getPublicEndpoint() { return publicEndpoint; }
    public void setPublicEndpoint(String publicEndpoint) { this.publicEndpoint = publicEndpoint; }

    public String getBucket() { return bucket; }
    public void setBucket(String bucket) { this.bucket = bucket; }

    public int getPresignExpirySeconds() { return presignExpirySeconds; }
    public void setPresignExpirySeconds(int presignExpirySeconds) { this.presignExpirySeconds = presignExpirySeconds; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
}
