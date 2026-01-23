package com.aura.retinal.config;

import com.aura.retinal.entity.ServicePackage;
import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.ServicePackageRepository;
import com.aura.retinal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(ServicePackageRepository packageRepo,
                                   UserRepository userRepo,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // Default admin for demo/viva
            if (userRepo.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                admin.setFullName("System Admin");
                userRepo.save(admin);
                System.out.println(">>> Seeded default admin: admin / admin123");
            }

            if (packageRepo.count() == 0) {
                // Tạo gói Basic
                ServicePackage basic = new ServicePackage();
                basic.setName("Basic Scan");
                basic.setDescription("3 lượt phân tích AI");
                basic.setPrice(new BigDecimal("50000"));
                basic.setCredits(3);
                basic.setDurationDays(30);
                basic.setActive(true);
                packageRepo.save(basic);

                // Tạo gói Premium
                ServicePackage premium = new ServicePackage();
                premium.setName("Premium Health");
                premium.setDescription("10 lượt phân tích + Ưu tiên xử lý");
                premium.setPrice(new BigDecimal("120000"));
                premium.setCredits(10);
                premium.setDurationDays(90);
                premium.setActive(true);
                packageRepo.save(premium);

                // Tạo gói Clinic (Cho phòng khám)
                ServicePackage clinic = new ServicePackage();
                clinic.setName("Clinic Pro");
                clinic.setDescription("500 lượt phân tích cho phòng khám");
                clinic.setPrice(new BigDecimal("5000000"));
                clinic.setCredits(500);
                clinic.setDurationDays(365);
                clinic.setActive(true);
                packageRepo.save(clinic);
                
                System.out.println(">>> Đã khởi tạo dữ liệu gói dịch vụ mẫu!");
            }
        };
    }
}