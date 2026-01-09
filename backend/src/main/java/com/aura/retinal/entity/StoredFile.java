package com.aura.retinal.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="stored_files")
public class StoredFile {
    @Id
    private UUID id;

    @Column(nullable=false)
    private String bucket;

    @Column(nullable=false)
    private String objectKey;

    @Column(nullable=false)
    private String contentType;

    @Column(nullable=false)
    private long sizeBytes;

    @Column(nullable=false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getBucket() { return bucket; }
    public void setBucket(String bucket) { this.bucket = bucket; }

    public String getObjectKey() { return objectKey; }
    public void setObjectKey(String objectKey) { this.objectKey = objectKey; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }

    public Instant getCreatedAt() { return createdAt; }
}
