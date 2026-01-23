package com.aura.retinal.repository;

import com.aura.retinal.entity.AiSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiSettingRepository extends JpaRepository<AiSetting, Long> {
    Optional<AiSetting> findBySettingKey(String settingKey);
}
