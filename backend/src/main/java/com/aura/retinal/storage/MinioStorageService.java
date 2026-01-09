package com.aura.retinal.storage;

import com.aura.retinal.config.MinioProperties;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;

@Service
public class MinioStorageService {

    private final MinioClient internalMinio;
    private final MinioClient publicMinio;
    private final MinioProperties props;

    public MinioStorageService(
            @Qualifier("internalMinioClient") MinioClient internalMinio,
            @Qualifier("publicMinioClient") MinioClient publicMinio,
            MinioProperties props
    ) {
        this.internalMinio = internalMinio;
        this.publicMinio = publicMinio;
        this.props = props;
    }

    public String bucket() { return props.getBucket(); }

    public void putBytes(String objectKey, byte[] bytes, String contentType) {
        try (ByteArrayInputStream in = new ByteArrayInputStream(bytes)) {
            internalMinio.putObject(
                    PutObjectArgs.builder()
                            .bucket(props.getBucket())
                            .object(objectKey)
                            .stream(in, bytes.length, -1)
                            .contentType(contentType)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("MinIO upload failed: " + objectKey, e);
        }
    }

    // ✅ Cách B: presign trực tiếp bằng public endpoint (localhost), KHÔNG rewrite host
    public String presignGet(String objectKey) {
        try {
            return publicMinio.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(props.getBucket())
                            .object(objectKey)
                            .expiry(props.getPresignExpirySeconds())
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("MinIO presign failed: " + objectKey, e);
        }
    }
}
