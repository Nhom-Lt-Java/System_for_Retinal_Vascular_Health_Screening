package com.aura.retinal.repository;

import com.aura.retinal.entity.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnalysisRepository extends JpaRepository<Analysis, UUID> {

    List<Analysis> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<Analysis> findTop1ByUser_IdOrderByCreatedAtDesc(Long userId);

    List<Analysis> findTop20ByOrderByCreatedAtDesc();

    // Reporting / dashboards
    List<Analysis> findAllByOrderByCreatedAtDesc();

    List<Analysis> findByUser_Clinic_IdOrderByCreatedAtDesc(Long clinicId);

    List<Analysis> findByUser_IdInOrderByCreatedAtDesc(List<Long> userIds);
    
}
