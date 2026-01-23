package com.aura.retinal.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * Google Identity Services ID token login.
 * Frontend obtains an ID token (credential) and sends it to backend for verification.
 */
public record GoogleLoginRequest(
        @NotBlank String idToken
) {}
