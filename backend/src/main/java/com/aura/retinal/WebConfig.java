package com.aura.retinal;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // 1. Cho phép Frontend (cả 3000 và 5173 cho chắc)
        config.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173"));
        
        // 2. Cho phép gửi kèm Token (quan trọng)
        config.setAllowCredentials(true);
        
        // 3. Cho phép tất cả các loại lệnh (GET, POST, PUT...)
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 4. Cho phép tất cả các loại dữ liệu đầu vào
        config.setAllowedHeaders(List.of("*"));
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}