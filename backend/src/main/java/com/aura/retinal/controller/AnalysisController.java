package com.aura.retinal.controller;

import com.aura.retinal.dto.AnalysisResponse;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.service.AnalysisService;
import com.aura.retinal.service.UserContextService;
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
    private final UserContextService userContext;

    public AnalysisController(AnalysisService service, UserContextService userContext) {
        this.service = service;
        this.userContext = userContext;
    }

    /**
     * Single upload (async queue).
     * - USER uploads for themselves.
     * - CLINIC/DOCTOR/ADMIN can specify userId to submit for a patient.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AnalysisResponse submit(@RequestPart("file") MultipartFile file,
                                   @RequestParam(value = "userId", required = false) Long userId,
                                   Authentication auth) throws Exception {

        User current = userContext.requireUser(auth);
        Long effectiveUserId = resolveTargetUserId(current, userId);

        byte[] bytes = file.getBytes();
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.jpg";
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        return service.submit(bytes, filename, contentType, effectiveUserId);
    }

    /**
     * Bulk upload (async queue) - supports >=100 images per request.
     */
    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<AnalysisResponse> submitBulk(@RequestPart("files") List<MultipartFile> files,
                                             @RequestParam(value = "userId", required = false) Long userId,
                                             Authentication auth) throws Exception {
        User current = userContext.requireUser(auth);
        Long effectiveUserId = resolveTargetUserId(current, userId);

        List<AnalysisService.FilePayload> payloads = files.stream().map(f -> {
            try {
                String fn = f.getOriginalFilename() != null ? f.getOriginalFilename() : "upload.jpg";
                String ct = f.getContentType() != null ? f.getContentType() : "image/jpeg";
                return new AnalysisService.FilePayload(f.getBytes(), fn, ct);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }).toList();

        return service.submitBulk(payloads, effectiveUserId);
    }

    @GetMapping("/{id}")
    public AnalysisResponse get(@PathVariable("id") UUID id) {
        return service.get(id);
    }

    @GetMapping("/my")
    public List<AnalysisResponse> my(Authentication auth) {
        User current = userContext.requireUser(auth);
        return service.listByUser(current.getId());
    }

    private static Long resolveTargetUserId(User current, Long requestedUserId) {
        if (current.getRole() == Role.USER) {
            return current.getId();
        }
        // CLINIC/DOCTOR/ADMIN: allow overriding userId for patient submissions
        return requestedUserId != null ? requestedUserId : current.getId();
    }
}
