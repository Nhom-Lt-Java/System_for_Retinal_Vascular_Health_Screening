package com.aura.retinal.controller.admin;

import com.aura.retinal.dto.admin.NotificationTemplateDto;
import com.aura.retinal.entity.NotificationTemplate;
import com.aura.retinal.repository.NotificationTemplateRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notification-templates")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationTemplateController {

    private final NotificationTemplateRepository repo;

    public AdminNotificationTemplateController(NotificationTemplateRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<NotificationTemplateDto> list() {
        return repo.findAll().stream().map(AdminNotificationTemplateController::toDto).toList();
    }

    @PostMapping
    public NotificationTemplateDto create(@Valid @RequestBody NotificationTemplateDto dto) {
        if (dto.templateKey() == null || dto.templateKey().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "templateKey required");
        }
        NotificationTemplate t = new NotificationTemplate();
        t.setTemplateKey(dto.templateKey().trim());
        t.setTitleTemplate(dto.titleTemplate() == null ? "" : dto.titleTemplate());
        t.setMessageTemplate(dto.messageTemplate() == null ? "" : dto.messageTemplate());
        t.setType(dto.type() == null || dto.type().isBlank() ? "SYSTEM" : dto.type().trim());
        t.setActive(dto.active());
        try {
            return toDto(repo.save(t));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public NotificationTemplateDto update(@PathVariable Long id, @Valid @RequestBody NotificationTemplateDto dto) {
        NotificationTemplate t = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Template not found"));

        if (dto.templateKey() != null && !dto.templateKey().isBlank()) t.setTemplateKey(dto.templateKey().trim());
        if (dto.titleTemplate() != null) t.setTitleTemplate(dto.titleTemplate());
        if (dto.messageTemplate() != null) t.setMessageTemplate(dto.messageTemplate());
        if (dto.type() != null && !dto.type().isBlank()) t.setType(dto.type().trim());
        t.setActive(dto.active());

        try {
            return toDto(repo.save(t));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    private static NotificationTemplateDto toDto(NotificationTemplate t) {
        return new NotificationTemplateDto(
                t.getId(),
                t.getTemplateKey(),
                t.getTitleTemplate(),
                t.getMessageTemplate(),
                t.getType(),
                t.isActive()
        );
    }
}
