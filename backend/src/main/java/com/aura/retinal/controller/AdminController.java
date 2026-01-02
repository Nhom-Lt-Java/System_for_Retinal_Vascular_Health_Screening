package com.aura.retinal.controller;

import com.aura.retinal.entity.*;
import com.aura.retinal.repository.ClinicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {


    @Autowired
    private ClinicRepository clinicRepo;

    @PutMapping("/approve/{id}")
    public Clinic approve(@PathVariable Long id) {
        Clinic c = clinicRepo.findById(id).orElseThrow();
        c.setStatus(ClinicStatus.APPROVED);
        return clinicRepo.save(c);
    }

    @PutMapping("/suspend/{id}")
    public Clinic suspend(@PathVariable Long id) {
        Clinic c = clinicRepo.findById(id).orElseThrow();
        c.setStatus(ClinicStatus.SUSPENDED);
        return clinicRepo.save(c);
    }
}
