package com.aura.retinal.repository;

import com.aura.retinal.entity.Clinic;
import com.aura.retinal.entity.ClinicStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClinicRepository extends JpaRepository<Clinic, Long> {
    List<Clinic> findByStatus(ClinicStatus status);
}
