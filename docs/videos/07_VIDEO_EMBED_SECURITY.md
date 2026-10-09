# 07. Video Embed Security & Allowlist Architecture

**Module:** Videos & Broadcast Archive (Phase 13)  
**Lead Coordinator:** Security Engineer & Solution Architect  
**Scope:** Embed URL Validation, Iframe Sandboxing, Content Security Policy (CSP), Click-to-Load Architecture

---

## 1. Security Threat Model

Allowing raw HTML video embeds or unsanitized URLs introduces critical attack vectors:
1. **Stored Cross-Site Scripting (XSS):** Malicious JavaScript payloads injected via `javascript:`, `data:`, or `vbscript:` schemes.
2. **Arbitrary Iframe Redirection & Phishing:** Attacker-controlled domains loaded within an `<iframe>`, spoofing authentication prompts or displaying unauthorized content under the advocate's domain.
3. **Server-Side Request Forgery (SSRF):** Internal endpoints (`http://169.254.169.254`, `http://localhost:8000`) probed via automated thumbnail fetchers or embed previews.
4. **Third-Party Surveillance & Cookie Tracking:** Direct preloading of video iframes that drop tracking cookies on visitors prior to user consent.

---

## 2. Security Controls & Mitigations

### 2.1 Protocol & Scheme Allowlist
Only `http` and `https` schemes are accepted. Any URL containing:
- `javascript:`
- `data:`
- `file:`
- `vbscript:`
- `blob:`
is immediately rejected with HTTP 422 Unprocessable Content.

### 2.2 Host & Embed Endpoint Allowlist
The application strictly enforces an allowlist of permitted iframe sources. The embed generator will **never** construct an iframe source for an arbitrary domain.

**Approved Embed Endpoints:**
```php
public const ALLOWED_EMBED_HOSTS = [
    'www.youtube-nocookie.com',
    'youtube-nocookie.com',
    'player.vimeo.com',
];
```

For external sources that do not match the approved providers:
- `embed_url` is returned as `null`.
- The public and admin UI renders a prominent, secure external watch button (`rel="noopener noreferrer" target="_blank"`).
- Direct iframe insertion is prohibited.

### 2.3 SSRF & Private Network Shield
`VideoPlatformService::isAllowedHost()` resolves domains using DNS lookups and checks against reserved CIDR ranges:
- `127.0.0.0/8` (Loopback)
- `10.0.0.0/8` (Private network)
- `172.16.0.0/12` (Private network)
- `192.168.0.0/16` (Private network)
- `169.254.0.0/16` (Link-local cloud metadata)
- `::1` / `fe80::/10` (IPv6 loopback & link-local)

Attempts to input internal hostnames or IPs are rejected.

### 2.4 Privacy-Enhanced YouTube Implementation
All YouTube embeds utilize `youtube-nocookie.com` instead of standard `youtube.com`. This ensures:
- Cookies are not set unless the visitor actively presses play.
- Complies with European and Bangladeshi privacy guidelines regarding non-essential tracking cookies.

### 2.5 Click-to-Load Performance & Sandbox Isolation
On both `/videos` (listing) and `/videos/:slug` (detail page):
1. **No Iframe at Mount:** The browser mounts a pure HTML/CSS poster displaying the high-resolution thumbnail and an accessible play button.
2. **Activation:** The iframe is injected only upon explicit user click or keyboard activation (`Enter` / `Space`).
3. **Iframe Attributes:**
   ```html
   <iframe
     src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1&rel=0"
     title="{title}"
     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
     allowfullscreen
     loading="lazy"
   ></iframe>
   ```
   - Mandatory accessible `title` attribute for screen readers.
   - Restrictive `allow` policy disabling unneeded device capabilities.
