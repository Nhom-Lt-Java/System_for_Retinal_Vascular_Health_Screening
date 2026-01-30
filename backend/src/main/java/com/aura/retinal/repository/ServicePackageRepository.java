package com.aura.retinal.repository;

import com.aura.retinal.entity.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicePackageRepository extends JpaRepository<ServicePackage, Long> {
    // Lấy các gói đang hoạt động (active = true)
    List<ServicePackage> findByActiveTrue();
}