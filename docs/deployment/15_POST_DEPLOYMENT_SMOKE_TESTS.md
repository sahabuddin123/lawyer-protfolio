# 15 — Post-Deployment Smoke Testing Runbook
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Automated Smoke Test Script (`smoke-test.sh`)

When deploying to staging or production, execute this automated verification script:

```bash
#!/bin/bash
set -euo pipefail

BASE_URL="https://nijamuddin.com"
echo "=== Starting Smoke Tests on ${BASE_URL} ==="

check_status() {
    local url="$1"
    local expected="$2"
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$status" -eq "$expected" ]; then
        echo "[PASS] $url -> $status"
    else
        echo "[FAIL] $url -> Expected $expected, got $status"
        exit 1
    fi
}

# 1. Health API
check_status "${BASE_URL}/api/v1/health" 200

# 2. Public Homepage & Navigation
check_status "${BASE_URL}/" 200
check_status "${BASE_URL}/about" 200
check_status "${BASE_URL}/practice-areas" 200
check_status "${BASE_URL}/courtroom" 200
check_status "${BASE_URL}/research" 200
check_status "${BASE_URL}/judgments" 200
check_status "${BASE_URL}/publications" 200
check_status "${BASE_URL}/media" 200
check_status "${BASE_URL}/videos" 200
check_status "${BASE_URL}/gallery" 200
check_status "${BASE_URL}/contact" 200

# 3. Security Boundary Checks
# Admin endpoint without token must return 401
check_status "${BASE_URL}/api/v1/admin/dashboard" 401
# Requesting hidden .env file must return 403 or 404
check_status "${BASE_URL}/.env" 403

# 4. SEO & Crawlers
check_status "${BASE_URL}/robots.txt" 200
check_status "${BASE_URL}/sitemap.xml" 200

echo "=== All Post-Deployment Smoke Tests PASSED ==="
```

---

## 2. Manual Verification Checklist
1. **Bilingual Switcher:** Click language toggle (EN <-> BN) on `/` and verify immediate script translation without page reload.
2. **Contact Form:** Submit a test message and verify success toast notification.
3. **Admin Auth:** Log into `/admin` using verified credentials; confirm dashboard stats hydrate cleanly.
4. **Media Lightbox:** Open an album on `/gallery` and verify modal lightbox opens and closes via `Escape`.
