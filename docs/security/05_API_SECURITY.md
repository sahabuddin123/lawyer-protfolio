# 05. REST API Security Specification

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Lead Coordinator:** API Security Engineer & Application Security Engineer  
**Status:** HARDENED  

---

## 1. Standardized Response Envelope

To prevent unintentional leaks and standardize client consumption, every API route routes through `App\Http\Responses\ApiResponse`:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "meta": { ... },
  "error_code": null
}
```
In error situations:
- `error_code` returns a machine-readable string (e.g. `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_FAILED`, `RATE_LIMIT_EXCEEDED`, `NOT_FOUND`).
- No internal stack traces or database schema errors are exposed when `APP_DEBUG=false`.

---

## 2. Input Validation & Type Safety

1. **FormRequest Enforcement**: 100% of mutation inputs are validated server-side.
2. **Enum & Choice Constraints**: Attributes such as `status` (`draft`, `published`, `archived`) and `visibility` (`public`, `private`, `unlisted`) are strictly constrained using `Rule::in(...)`.
3. **Date Validation**: Dates are validated with `date_format:Y-m-d` or `date_format:Y-m-d H:i:s`.
4. **ID Typecasting**: Numeric route parameters and foreign keys are explicitly cast to integers.

---

## 3. SQL Injection Defense

- **No Raw SQL Interpolation**: All database operations leverage Laravel's Eloquent ORM or parameterized query bindings.
- **Sort Column Whitelisting**: Every controller supporting dynamic sorting validates `$sortBy` against a strictly defined whitelist of allowable columns (e.g. `['sort_order', 'published_date', 'created_at']`). Unapproved column strings automatically fall back to default sorting.
- **Sort Direction Validation**: `$sortDir` is strictly normalized to `'asc'` or `'desc'`.

---

## 4. SSRF & URL Safety

- **Zero Outbound HTTP Requests**: The backend initiates no server-side fetching of remote resources, completely eliminating SSRF vectors.
- **Embedded Media Sanitization**: YouTube and Vimeo embeds are parsed via `VideoPlatformService`, strictly allowing verified hostnames (`youtube-nocookie.com`, `player.vimeo.com`) and generating safe embed URLs from validated alphanumeric IDs.

---

## 5. Anti-Abuse Measures

- **Pagination Bounding**: All paginated responses enforce a maximum `per_page` ceiling (50 for public endpoints, 100 for administrative endpoints), mitigating memory exhaustion attacks.
- **Honeypot Trap**: Public contact and consultation endpoints inspect a hidden `_honeypot` field. Bot submissions with populated honeypots are silently dropped with a generic success response (tarpit defense).
