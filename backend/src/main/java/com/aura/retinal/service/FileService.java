package com.aura.retinal.service;

import com.aura.retinal.entity.StoredFile;
import com.aura.retinal.repository.StoredFileRepository;
import com.aura.retinal.storage.MinioStorageService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class FileService {
    private final StoredFileRepository repo;
    private final MinioStorageService storage;

    public FileService(StoredFileRepository repo, MinioStorageService storage) {
        this.repo = repo;
        this.storage = storage;
    }

    /**
     * Cách cũ: backend tự upload bytes lên MinIO rồi lưu DB.
     * Bạn có thể giữ lại để không break các chỗ khác.
     */
    public StoredFile upload(String objectKey, byte[] bytes, String contentType) {
        UUID id = UUID.randomUUID();
        storage.putBytes(objectKey, bytes, contentType);

        StoredFile f = new StoredFile();
        f.setId(id);
        f.setBucket(storage.bucket());
        f.setObjectKey(objectKey);
        f.setContentType(contentType);
        f.setSizeBytes(bytes.length);

        return repo.save(f);
    }

    /**
     * Cách mới: AI Core đã upload artifact lên MinIO rồi.
     * Backend chỉ "register" objectKey + metadata vào DB để lấy presigned URL sau này.
     */
    public StoredFile register(String objectKey, String contentType, long sizeBytes) {
        StoredFile f = new StoredFile();
        f.setId(UUID.randomUUID());
        f.setBucket(storage.bucket());
        f.setObjectKey(objectKey);
        f.setContentType(contentType);
        f.setSizeBytes(sizeBytes);
        return repo.save(f);
    }

    public String presignedUrl(UUID fileId) {
        StoredFile f = repo.findById(fileId).orElseThrow();
        return storage.presignGet(f.getObjectKey());
    }

    public byte[] downloadBytes(UUID fileId) {
        StoredFile f = repo.findById(fileId).orElseThrow();
        return storage.getBytes(f.getObjectKey());
    }

    public StoredFile get(UUID fileId) {
        return repo.findById(fileId).orElseThrow();
    }
}
