package com.retinalscreening.backend2_orchestrator.repository;

import com.retinalscreening.backend2_orchestrator.entity.AnalysisJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, UUID> {
}