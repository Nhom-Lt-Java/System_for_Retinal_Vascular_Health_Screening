package com.aura.retinal.controller;

import com.aura.retinal.entity.ServicePackage;
import com.aura.retinal.repository.ServicePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/packages")
@PreAuthorize("hasRole('ADMIN')") // Chỉ Admin mới được truy cập
public class AdminPackageController {

    @Autowired
    private ServicePackageRepository packageRepo;

    @GetMapping
    public List<ServicePackage> getAllPackages() {
        return packageRepo.findAll(); // Lấy cả gói đang ẩn
    }

    @PostMapping
    public ServicePackage createPackage(@RequestBody ServicePackage pkg) {
        return packageRepo.save(pkg);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicePackage> updatePackage(@PathVariable Long id, @RequestBody ServicePackage details) {
        return packageRepo.findById(id).map(pkg -> {
            pkg.setName(details.getName());
            pkg.setPrice(details.getPrice());
            pkg.setCredits(details.getCredits());
            pkg.setDescription(details.getDescription());
            pkg.setActive(details.getActive());
            return ResponseEntity.ok(packageRepo.save(pkg));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(@PathVariable Long id) {
        // Soft delete: Chỉ tắt active chứ không xóa hẳn để giữ lịch sử giao dịch
        return packageRepo.findById(id).map(pkg -> {
            pkg.setActive(false);
            packageRepo.save(pkg);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}