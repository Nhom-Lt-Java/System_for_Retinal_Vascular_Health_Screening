package com.aura.retinal.controller;

import com.aura.retinal.dto.AnalysisResponse;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.UserRepository;
import com.aura.retinal.service.AnalysisService;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analyses")
public class AnalysisController {

    private final AnalysisService service;
    private final UserRepository userRepo;

    public AnalysisController(AnalysisService service, UserRepository userRepo) {
        this.service = service;
        this.userRepo = userRepo;
    }

    // userId query param giữ lại để test/backward compatible
    // Khi có token: lấy username trong token -> ra userId thật
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AnalysisResponse create(@RequestPart("file") MultipartFile file,
                                   @RequestParam(value = "userId", required = false) Long userId,
                                   Authentication auth) throws Exception {
        byte[] bytes = file.getBytes();
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.jpg";
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        Long effectiveUserId = userId;
        if (auth != null && auth.getName() != null) {
            User u = userRepo.findByUsername(auth.getName()).orElseThrow();
            effectiveUserId = u.getId();
        }

        return service.create(bytes, filename, contentType, effectiveUserId);
    }

    @GetMapping("/{id}")
    public AnalysisResponse get(@PathVariable("id") UUID id) {
        return service.get(id);
    }

    // NEW: lấy lịch sử của chính user đang đăng nhập (DB)
    @GetMapping("/my")
    public List<AnalysisResponse> my(Authentication auth) {
        User u = userRepo.findByUsername(auth.getName()).orElseThrow();
        return service.listByUserId(u.getId());
    }
}
