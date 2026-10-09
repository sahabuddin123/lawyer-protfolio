# 03. Authentication Hardening

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Lead Coordinator:** Authentication / Identity Security Engineer  
**Status:** SECURE BY DEFAULT  

---

## 1. Authentication Architecture

The platform uses **Laravel Sanctum** token-based authentication (`Bearer` tokens) for all administrative operations.

### Key Authentication Guardrails:
1. **Cryptographic Token Hashing**:
   - Sanctum tokens are hashed using SHA-256 before storage in `personal_access_tokens`. Plaintext tokens are returned exactly once upon successful login.
2. **Password Storage**:
   - All passwords are encrypted using **Bcrypt** with `rounds = 12`.
   - Plaintext passwords are never stored, logged, or serialized.
   - `User` model defines `'password' => 'hashed'` in casts and `$hidden = ['password', 'remember_token']`.
3. **Session & Token Revocation**:
   - On explicit logout (`POST /api/v1/auth/logout`), the active access token is physically deleted from the database.
   - On password reset (`POST /api/v1/auth/reset-password`), all active tokens across all devices are deleted (`$user->tokens()->delete()`), terminating any compromised sessions.
4. **Inactive Account Lockout**:
   - If an account has `is_active = false`, authentication attempts are rejected immediately with HTTP 403 `ACCOUNT_INACTIVE` before issuing any tokens.
5. **Anti-User Enumeration**:
   - The password reset request endpoint (`POST /api/v1/auth/forgot-password`) returns an identical generic response whether an email exists or not:
     `"If the email address exists in our system, a password reset instruction has been dispatched."`
6. **Single-Use, Time-Limited Password Reset Tokens**:
   - Password reset tokens expire after **60 minutes**.
   - Upon consumption in `resetPassword()`, the token record is immediately deleted from `password_reset_tokens`, preventing replay attacks.
7. **Brute-Force Throttling**:
   - Authentication routes (`/login`, `/forgot-password`, `/reset-password`) are protected by a dual-layer rate limiter:
     - 5 attempts per minute per IP.
     - 5 attempts per minute per compound `email|IP` key.

---

## 2. API Response Security

All authentication responses return standardized envelopes (`ApiResponse`) and utilize `UserResource`.
- No password hashes, salts, or reset tokens are ever present in JSON payloads.
- Device names are sanitized and limited to 50 characters to prevent header injection.

---

## 3. Automated Verification

- Test Suite: `Tests\Feature\Security\AuthenticationSecurityTest`
  - `✓ inactive_user_cannot_authenticate`
  - `✓ logout_invalidates_sanctum_token`
  - `✓ forgot_password_does_not_enumerate_users`
  - `✓ password_reset_tokens_are_hashed_and_single_use`
  - `✓ password_hash_never_exposed_in_api_responses`
