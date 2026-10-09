# Rate Limiting & Anti-Abuse Architecture

## 1. Overview
Rate limiting safeguards the Advocate Nijam Uddin platform against brute-force credential guessing, password reset flooding, denial of service (DoS), automated content scraping, and spam submissions.

In Phase 18, rate limiters configured in `AppServiceProvider.php` were reviewed and reinforced.

---

## 2. Rate Limiting Policy Inventory

| Route / Context | Rate Limiter Name | Threshold | Key / Scope | Response |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication (Login/Reset)** | `auth` | 5 req / minute | IP address **AND** compound `email\|IP` | 429 Too Many Requests |
| **Public Contact Messages** | `contact-submissions` | 5 req / minute | Client IP address | 429 Too Many Requests |
| **Consultation Bookings** | `consultation-intake`| 5 req / minute | Client IP address | 429 Too Many Requests |
| **General Public API** | `api` (public) | 60 req / minute | Client IP address | 429 Too Many Requests |
| **Admin API Management** | `api` (admin) | 120 req / minute | Authenticated User ID or IP | 429 Too Many Requests |

---

## 3. Implementation Details (`AppServiceProvider.php`)

### 3.1 Compound Authentication Limiter
To defeat distributed credential stuffing (attackers rotating IPs) as well as targeted account lockouts, authentication requests are throttled on two simultaneous axes:
```php
RateLimiter::for('auth', function (Request $request) {
    $email = (string) $request->input('email');
    return [
        Limit::perMinute(5)->by($request->ip()),
        Limit::perMinute(5)->by(strtolower($email) . '|' . $request->ip()),
    ];
});
```

### 3.2 Lead & Consultation Form Intake
Public intake forms are safeguarded against spam bot flooding:
```php
RateLimiter::for('contact-submissions', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip())->response(function () {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => 'RATE_LIMIT_EXCEEDED',
                'message' => 'Too many submissions. Please wait a minute before trying again.'
            ]
        ], 429);
    });
});
```

---

## 4. Pagination & Query Abuse Protection

### 4.1 Bounded `per_page` Parameter
To prevent memory exhaustion attacks via `?per_page=1000000`:
- Public queries are capped to a strict maximum of **50 items per page**.
- Admin queries are capped to a maximum of **100 items per page**.
- Any requested `per_page` value above these limits is silently clamped by query builder scopes.

### 4.2 Query Complexity & Search Length Bounding
- Search query parameters (`?search=...` or `?q=...`) are capped to 100 characters in request validation rules.
- Wildcards (`%`) are sanitized to prevent unbounded SQL full-table scans.

---

## 5. Verification & Test Evidence
Validated by automated test suite `backend/tests/Feature/Security/InjectionAndDefenseSecurityTest.php`:
1. `it_enforces_safe_pagination_and_clamps_excessive_per_page_requests` -> PASS
   - Verified that requesting `?per_page=999999` returns no more than 50 records.
