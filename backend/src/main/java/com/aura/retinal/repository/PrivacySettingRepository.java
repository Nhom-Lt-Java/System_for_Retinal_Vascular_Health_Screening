package com.aura.retinal.repository;

import com.aura.retinal.entity.PrivacySetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PrivacySettingRepository extends JpaRepository<PrivacySetting, Long> {
    Optional<PrivacySetting> findByUser_Id(Long userId);
}