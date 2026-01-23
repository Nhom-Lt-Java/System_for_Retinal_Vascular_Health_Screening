package com.aura.retinal.dto.admin;

public record NotificationTemplateDto(
        Long id,
        String templateKey,
        String titleTemplate,
        String messageTemplate,
        String type,
        boolean active
) {}
