package com.aura.retinal.config;

import com.aura.retinal.security.AuditLoggingInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AuditLoggingConfig implements WebMvcConfigurer {

    private final AuditLoggingInterceptor interceptor;

    public AuditLoggingConfig(AuditLoggingInterceptor interceptor) {
        this.interceptor = interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(interceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/me");
    }
}
