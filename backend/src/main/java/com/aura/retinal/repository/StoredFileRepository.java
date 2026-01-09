package com.aura.retinal.repository;

import com.aura.retinal.entity.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface StoredFileRepository extends JpaRepository<StoredFile, UUID> {}
