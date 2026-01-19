package com.aura.retinal.repository;

import com.aura.retinal.entity.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, Long> {
    List<ServicePackage> findByActiveTrue();
}