package com.aura.retinal.repository;

import com.aura.retinal.entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicRepository  extends JpaRepository<Clinic, Long> {
}
