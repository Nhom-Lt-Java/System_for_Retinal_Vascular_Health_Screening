package com.aura.retinal.controller;

import com.aura.retinal.entity.Clinic;
import com.aura.retinal.entity.ClinicStatus;
import com.aura.retinal.repository.ClinicRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/clinics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminClinicController {

    private final ClinicRepository clinicRepo;

    public AdminClinicController(ClinicRepository clinicRepo) {
        this.clinicRepo = clinicRepo;
    }

    @GetMapping
    public List<Clinic> list() {
        return clinicRepo.findAll();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Clinic> approve(@PathVariable Long id) {
        return clinicRepo.findById(id)
                .map(c -> {
                    c.setStatus(ClinicStatus.APPROVED);
                    return ResponseEntity.ok(clinicRepo.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<Clinic> suspend(@PathVariable Long id) {
        return clinicRepo.findById(id)
                .map(c -> {
                    c.setStatus(ClinicStatus.SUSPENDED);
                    return ResponseEntity.ok(clinicRepo.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
