package com.aura.retinal.controller;

import com.aura.retinal.dto.clinic.ClinicCreateDoctorRequest;
import com.aura.retinal.dto.clinic.ClinicDoctorResponse;
import com.aura.retinal.dto.clinic.ClinicPatientResponse;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.service.ReportingService;
import com.aura.retinal.service.UserContextService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Clinic module.
 * - FR-25/26: dashboard
 * - FR-23: manage doctors/users (minimal demo)
 */
@RestController
@RequestMapping("/api/clinic")
@PreAuthorize("hasRole('CLINIC')")
public class ClinicController {

    private final UserContextService userContext;
    private final ReportingService reporting;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public ClinicController(UserContextService userContext,
                            ReportingService reporting,
                            UserRepository userRepo,
                            PasswordEncoder passwordEncoder) {
        this.userContext = userContext;
        this.reporting = reporting;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication auth) {
        User clinic = userContext.requireUser(auth);
        return reporting.getClinicDashboard(clinic);
    }

    @GetMapping("/doctors")
    public List<ClinicDoctorResponse> listDoctors(Authentication auth) {
        User clinic = userContext.requireUser(auth);
        if (clinic.getClinic() == null) return List.of();
        Long clinicId = clinic.getClinic().getId();
        return userRepo.findByClinic_IdAndRole(clinicId, Role.DOCTOR).stream()
                .map(d -> new ClinicDoctorResponse(d.getId(), d.getUsername(), d.getFullName(), d.getPhone()))
                .toList();
    }

    @PostMapping("/doctors")
    public ClinicDoctorResponse createDoctor(@Valid @RequestBody ClinicCreateDoctorRequest req, Authentication auth) {
        User clinic = userContext.requireUser(auth);
        if (clinic.getClinic() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Clinic profile not linked");
        }

        userRepo.findByUsername(req.username()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        });

        User d = new User();
        d.setUsername(req.username());
        d.setPassword(passwordEncoder.encode(req.password()));
        d.setRole(Role.DOCTOR);
        d.setFullName(req.fullName());
        d.setPhone(req.phone());
        d.setClinic(clinic.getClinic());

        User saved = userRepo.save(d);
        return new ClinicDoctorResponse(saved.getId(), saved.getUsername(), saved.getFullName(), saved.getPhone());
    }

    @GetMapping("/patients")
    public List<ClinicPatientResponse> listPatients(Authentication auth) {
        User clinic = userContext.requireUser(auth);
        if (clinic.getClinic() == null) return List.of();
        Long clinicId = clinic.getClinic().getId();
        return userRepo.findByClinic_IdAndRole(clinicId, Role.USER).stream()
                .map(p -> new ClinicPatientResponse(p.getId(), p.getUsername(), p.getFullName(), p.getAssignedDoctorId()))
                .toList();
    }

    /** Assign a patient to a doctor in the same clinic (FR-13/23 demo). */
    @PutMapping("/patients/{patientId}/assign-doctor")
    public ClinicPatientResponse assignDoctor(@PathVariable Long patientId,
                                             @RequestParam Long doctorId,
                                             Authentication auth) {
        User clinic = userContext.requireUser(auth);
        if (clinic.getClinic() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Clinic profile not linked");
        }
        Long clinicId = clinic.getClinic().getId();

        User patient = userRepo.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        if (patient.getClinic() == null || !clinicId.equals(patient.getClinic().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patient not in your clinic");
        }

        User doctor = userRepo.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        if (doctor.getRole() != Role.DOCTOR || doctor.getClinic() == null || !clinicId.equals(doctor.getClinic().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor not in your clinic");
        }

        patient.setAssignedDoctor(doctor);
        User saved = userRepo.save(patient);
        return new ClinicPatientResponse(saved.getId(), saved.getUsername(), saved.getFullName(), saved.getAssignedDoctorId());
    }
}
