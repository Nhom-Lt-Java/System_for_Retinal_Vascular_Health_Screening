package com.aura.retinal.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys; // Import thêm cái này
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    
    private final String SECRET = "DayLaDoanMaBiMatCucKyDaiDeTranhLoiBaoMatChoJWT123456";

    // Hàm tạo Key chuẩn từ chuỗi String
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 ngày
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Dùng Key chuẩn thay vì String
                .compact();
    }

    public String extractUsername(String token) {
        // Dùng parserBuilder() cho các phiên bản thư viện mới
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}