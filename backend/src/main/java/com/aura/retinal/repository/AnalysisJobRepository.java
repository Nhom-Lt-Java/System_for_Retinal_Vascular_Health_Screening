package com.aura.retinal.repository;

import com.aura.retinal.entity.AnalysisJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, Long> {

    @Query(value = "SELECT * FROM analysis_jobs WHERE status = 'QUEUED' ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1", nativeQuery = true)
    Optional<AnalysisJob> lockNextQueued();

    @Query(value = "SELECT count(*) FROM analysis_jobs WHERE status = :status", nativeQuery = true)
    long countByStatus(@Param("status") String status);
}
