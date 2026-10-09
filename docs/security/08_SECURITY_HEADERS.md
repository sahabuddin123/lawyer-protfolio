# Security Headers & Defense-in-Depth

## 1. Overview
HTTP Security Headers provide crucial protocol-level instructions to client user agents, preventing clickjacking, MIME-sniffing, cross-site scripting (XSS), referrer leaks, and unauthorized hardware sensor access.

In Phase 18, `backend/app/Http/Middleware/SecurityHeaders.php` was engineered and deployed across both the `web` and `api` middleware pipelines in `bootstrap/app.php`.

---

## 2. Security Headers Inventory & Configuration

### 2.1 Content-Security-Policy (CSP)
The CSP defines the exact, authorized origins for scripts, styles, fonts, frames, media, and connections:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:; media-src 'self' https: blob:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://maps.google.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self';
```

#### Directive Justification
- `default-src 'self'`: Default fallback restricts all unlisted resource fetches to the application's origin.
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'`: Accommodates Vite development / React client hydration while forbidding untrusted external script domains.
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: Permits Google Fonts stylesheet delivery alongside React styled components.
- `font-src 'self' https://fonts.gstatic.com data:`: Allows Google Fonts font binaries and inlined base64 fonts.
- `frame-src`: Strictly restricted to trusted video platforms (YouTube, Vimeo) and map embeds (Google Maps).
- `frame-ancestors 'self'`: Defense against clickjacking; modern replacement for `X-Frame-Options: SAMEORIGIN`.
- `form-action 'self'`: Blocks form action hijacking / phish forms sending POST payloads to external domains.

### 2.2 X-Frame-Options
```http
X-Frame-Options: SAMEORIGIN
```
Provides backward compatibility for older browsers lacking CSP Level 2 `frame-ancestors` support.

### 2.3 X-Content-Type-Options
```http
X-Content-Type-Options: nosniff
```
Prevents browsers from MIME-sniffing a response away from the declared `Content-Type`. Vital for file downloads and media serving.

### 2.4 Referrer-Policy
```http
Referrer-Policy: strict-origin-when-cross-origin
```
Ensures that full URL paths containing potential query parameters or internal IDs are never leaked when navigating to cross-origin destinations. Sends origin only (e.g. `https://nijamuddin.com/`) over HTTPS to cross-origin, and zero referrer if navigating to HTTP.

### 2.5 Permissions-Policy
```http
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```
Disables sensitive hardware APIs across the entire application context, preventing unauthorized access by third-party embeds or rogue scripts.

### 2.6 Strict-Transport-Security (HSTS)
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
Forces all subsequent client connections to use HTTPS for one year (`max-age=31536000`).
> *Note on HSTS Preload:* Preload has been intentionally omitted until production DNS and domain stability are formally certified in Phase 20, preventing permanent lockouts.

---

## 3. Implementation in Middleware
```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

        $csp = "default-src 'self'; " .
               "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
               "font-src 'self' https://fonts.gstatic.com data:; " .
               "img-src 'self' data: https: blob:; " .
               "connect-src 'self' https:; " .
               "media-src 'self' https: blob:; " .
               "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://maps.google.com; " .
               "frame-ancestors 'self'; " .
               "base-uri 'self'; " .
               "form-action 'self';";
        $response->headers->set('Content-Security-Policy', $csp);

        if ($request->isSecure() || app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
```

---

## 4. Verification & Test Evidence
Validated by automated test suite `backend/tests/Feature/Security/HeadersAndCorsSecurityTest.php`:
1. `it_attaches_all_required_security_headers_to_api_responses` -> PASS
2. `it_attaches_all_required_security_headers_to_web_crawl_routes` -> PASS
