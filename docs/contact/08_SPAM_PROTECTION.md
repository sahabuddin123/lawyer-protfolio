# 08. Anti-Spam & Honeypot Architecture

**Module:** Contact & Legal Consultation (Phase 15)  
**Lead Coordinator:** Security Engineer & Solution Architect  
**Implementation:** `PublicContactController.php`, `AppServiceProvider.php`

---

## 1. Zero-Friction Honeypot Trap

To avoid requiring intrusive CAPTCHAs that impede citizens and prospective clients seeking urgent legal assistance, the platform employs a transparent Honeypot mechanism:

1. **Frontend Injection:**
   ```html
   <input
     type="text"
     name="_honeypot"
     style="display: none;"
     tabIndex="-1"
     autoComplete="off"
   />
   ```
2. **Behavioral Invariant:**
   - Real human visitors navigating through keyboard or mouse do not perceive or fill this invisible input.
   - Malicious bots and web scrapers greedily populate every form input in the DOM.
3. **Backend Silent Tarpit Defense:**
   - If `_honeypot` is non-empty, the controller immediately halts execution.
   - It returns a standard HTTP 200 OK simulated response (`received: true`).
   - It **permanently aborts database persistence**, discarding the spam flood without leaking detection mechanics to the attacker.

---

## 2. Server-Side Rate Limiting

The public submission endpoints are protected by the `throttle:intake` rate limiter configured in `AppServiceProvider.php`:
- **Limit:** 5 submissions per minute per IP address.
- Exceeding the threshold triggers HTTP `429 Too Many Requests` (`RATE_LIMIT_EXCEEDED`).
- The frontend dynamically displays a polite rate limit notice advising the user to wait before submitting further inquiries.
