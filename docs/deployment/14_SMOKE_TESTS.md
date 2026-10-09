# 14 — Post-Deployment Automated Smoke Testing Runbook
**Project:** Advocate Nijam Uddin (Haq) — Premium Lawyer Portfolio Website  
**Target Domain:** `https://nijamuddin.com`  
**Execution Context:** Run from any terminal or server console after release activation.  

---

## 1. Automated Smoke Test Script

Save as `/www/wwwroot/nijamuddin-deploy/repo/docs/deployment/14_SMOKE_TESTS.sh` (or run directly via bash):

```bash
#!/usr/bin/env bash
# ==============================================================================
# POST-DEPLOYMENT SMOKE TEST RUNNER FOR NIJAMUDDIN.COM
# ==============================================================================
set -euo pipefail

BASE_URL="${1:-https://nijamuddin.com}"
PASSED=0
FAILED=0

check_endpoint() {
    local url="$1"
    local expected_code="$2"
    local description="$3"

    echo -n "Checking ${description} [${url}] ... "
    local http_code
    http_code="$(curl -k -s -o /dev/null -w "%{http_code}" "${url}")"

    if [[ "${http_code}" == "${expected_code}" ]]; then
        echo "PASS (HTTP ${http_code})"
        PASSED=$((PASSED + 1))
    else
        echo "FAIL (Expected HTTP ${expected_code}, got ${http_code})"
        FAILED=$((FAILED + 1))
    fi
}

echo "=================================================================="
echo "Starting Smoke Verification for: ${BASE_URL}"
echo "=================================================================="

# 1. Frontend SPA Delivery
check_endpoint "${BASE_URL}/" "200" "Homepage SPA Entry"
check_endpoint "${BASE_URL}/about" "200" "Nested React Route: About"
check_endpoint "${BASE_URL}/practice-areas" "200" "Nested React Route: Practice Areas"
check_endpoint "${BASE_URL}/contact" "200" "Nested React Route: Contact"
check_endpoint "${BASE_URL}/admin/login" "200" "Nested React Route: Admin Login"

# 2. Public API Endpoints
check_endpoint "${BASE_URL}/api/v1/health" "200" "API Health Endpoint"
check_endpoint "${BASE_URL}/api/v1/home" "200" "API Public Home Data"
check_endpoint "${BASE_URL}/api/v1/practice-areas" "200" "API Practice Areas"
check_endpoint "${BASE_URL}/api/v1/articles" "200" "API Legal Articles"

# 3. Security & Access Control
check_endpoint "${BASE_URL}/api/v1/admin/dashboard" "401" "Protected Admin API (Unauthenticated)"
check_endpoint "${BASE_URL}/.env" "404" "Nginx Hidden File Protection (.env)"
check_endpoint "${BASE_URL}/.git/config" "404" "Nginx Hidden Git Protection (.git)"

# 4. SEO & Compliance Files
check_endpoint "${BASE_URL}/robots.txt" "200" "Robots.txt"
check_endpoint "${BASE_URL}/sitemap.xml" "200" "XML Sitemap"

echo "=================================================================="
echo "Smoke Tests Summary: ${PASSED} Passed, ${FAILED} Failed."
echo "=================================================================="

if [[ ${FAILED} -gt 0 ]]; then
    exit 1
fi
exit 0
```

---

## 2. Manual Verification Checklist

In addition to automated curl requests, verify in a modern desktop browser:

1. **SSL/TLS Certificate:**
   - Padlock icon displayed without mixed-content warnings.
   - Issued to `nijamuddin.com` with SAN for `www.nijamuddin.com`.
2. **Language Toggle:**
   - Switch from English to Bangla (বাংলা) and confirm all UI text and CMS articles update seamlessly.
3. **Admin Authentication & Session Flow:**
   - Navigate to `/admin/login`.
   - Submit valid credentials.
   - Confirm redirection to `/admin/dashboard` with Sanctum cookie/token session established.
   - Test logout and verify session invalidation.
4. **Appointment Booking Submission:**
   - Submit a test consultation request on `/contact` or appointment modal.
   - Confirm CSRF protection and validation response.
5. **Direct Browser Refresh:**
   - Navigate to `/about`, press `Ctrl + F5` (hard refresh), and verify the page loads correctly rather than showing an Nginx 404 page.
