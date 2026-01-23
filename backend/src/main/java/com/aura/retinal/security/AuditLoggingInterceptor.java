package com.aura.retinal.security;

import com.aura.retinal.entity.User;
import com.aura.retinal.service.AuditLogService;
import com.aura.retinal.service.UserContextService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * FR-37: Audit logging.
 * Logs key actions after request completion.
 */
@Component
public class AuditLoggingInterceptor implements HandlerInterceptor {

    private final AuditLogService audit;
    private final UserContextService userContext;

    public AuditLoggingInterceptor(AuditLogService audit, UserContextService userContext) {
        this.audit = audit;
        this.userContext = userContext;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                @Nullable Exception ex) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String action = actionFor(uri, method);
        if (action == null) return;

        // Only log successful actions (2xx/3xx). You can loosen this if you want.
        int status = response.getStatus();
        if (status >= 400) {
            action = action + "_FAILED";
        }

        User actor = null;
        try {
            actor = userContext.tryGetUser();
        } catch (Exception ignored) {
        }

        String ip = clientIp(request);
        String qs = request.getQueryString();
        String details = method + " " + uri + (qs != null ? ("?" + qs) : "") + " | status=" + status;
        audit.log(action, actor, details, ip);
    }

    private static String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static String actionFor(String uri, String method) {
        if (uri == null) return null;

        // Auth
        if ("POST".equalsIgnoreCase(method) && uri.equals("/api/auth/login")) return "LOGIN";
        if ("POST".equalsIgnoreCase(method) && uri.equals("/api/auth/register")) return "REGISTER";

        // Upload
        if ("POST".equalsIgnoreCase(method) && uri.equals("/api/analyses")) return "UPLOAD_SINGLE";
        if ("POST".equalsIgnoreCase(method) && uri.equals("/api/analyses/bulk")) return "UPLOAD_BULK";

        // Exports
        if ("GET".equalsIgnoreCase(method) && uri.startsWith("/api/reports/pdf/")) return "EXPORT_PDF";
        if ("GET".equalsIgnoreCase(method) && uri.equals("/api/reports/csv")) return "EXPORT_CSV";

        // Billing
        if ("POST".equalsIgnoreCase(method) && uri.equals("/api/billing/purchase")) return "PURCHASE";

        // Doctor review
        if ("POST".equalsIgnoreCase(method) && uri.startsWith("/api/doctor/analyses/") && uri.endsWith("/review")) {
            return "DOCTOR_REVIEW";
        }

        // Admin AI settings
        if ("PUT".equalsIgnoreCase(method) && uri.startsWith("/api/admin/ai-settings")) return "AI_SETTINGS_UPDATE";

        // Chat
        if ("POST".equalsIgnoreCase(method) && uri.equals("/api/messages/send")) return "CHAT_SEND";

        return null;
    }
}
