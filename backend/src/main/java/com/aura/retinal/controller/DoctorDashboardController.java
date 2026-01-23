package com.aura.retinal.controller;

import com.aura.retinal.entity.User;
import com.aura.retinal.service.ReportingService;
import com.aura.retinal.service.UserContextService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorDashboardController {

    private final UserContextService userContext;
    private final ReportingService reporting;

    public DoctorDashboardController(UserContextService userContext, ReportingService reporting) {
        this.userContext = userContext;
        this.reporting = reporting;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication auth) {
        User doctor = userContext.requireUser(auth);
        return reporting.getDoctorDashboard(doctor);
    }
}
