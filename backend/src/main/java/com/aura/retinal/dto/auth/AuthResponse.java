package com.aura.retinal.dto.auth;

/**
 * Response trả về sau khi login/register.
 * - token: JWT (demo)
 * - user: thông tin tối thiểu để frontend lấy userId, role...
 */
public record AuthResponse(
        String token,
        AuthUser user
) {
}
