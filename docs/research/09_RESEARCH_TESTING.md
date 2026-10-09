# 09. Legal Research — Testing Strategy, QA & Verification Suites

**Lead Coordinator:** QA Engineer & Automation/E2E Engineer  
**Status:** 100% Passing (135/135 Backend Tests, Zero Frontend Build Errors)

---

## 1. Test Architecture & Coverage

The testing harness covers the entire domain lifecycle from data persistence and RBAC authorization to public caching, security headers, XSS filtering, and end-to-end editorial transitions.

### 1.1 Backend Feature Suites (`backend/tests/Feature/Research/`)

1. **`AdminLegalResearchTest.php` (10 Tests):**
   - `test_unauthenticated_admin_request_is_rejected`: Verifies 401 response on unauthenticated access.
   - `test_user_without_permission_receives_403`: Verifies RBAC barrier for unprivileged users.
   - `test_admin_can_list_legal_research_with_filters`: Verifies administrative filtering (status, visibility, type).
   - `test_admin_can_create_legal_research_monograph`: Verifies record creation, XSS sanitization, and audit logging.
   - `test_slug_uniqueness_is_enforced`: Verifies 422 validation failure on duplicate slug.
   - `test_published_slug_change_creates_301_redirect`: Verifies 301 redirect and audit log generation.
   - `test_admin_can_soft_delete_legal_research`: Verifies soft delete and audit log.
   - `test_admin_can_reorder_research_monographs`: Verifies batch reorder logic.
   - `test_admin_can_preview_draft_research_with_indexing_safety`: Verifies `X-Robots-Tag: noindex, nofollow` on draft preview.
   - `test_admin_can_download_attached_pdf`: Verifies authenticated staff download stream.

2. **`PublicLegalResearchTest.php` (6 Tests):**
   - `test_public_research_empty_state`: Verifies zero fake data returned on empty queries.
   - `test_public_research_returns_published_and_public_visibility_only`: Verifies draft and private exclusion.
   - `test_public_research_respects_locale_switching`: Verifies English and Bengali localization (`Accept-Language`).
   - `test_public_detail_endpoint_returns_published_monograph`: Verifies complete monograph payload and tags.
   - `test_public_detail_returns_404_for_draft_or_private`: Verifies 404 security barriers.
   - `test_public_pdf_download_security`: Verifies secure PDF streaming with nosniff headers.

3. **`ResearchE2ELifecycleTest.php` (1 Comprehensive Test):**
   - Executes the complete 14-step editorial lifecycle:
     Admin login -> Create draft -> Verify NOT publicly visible -> Preview as authorized admin -> Publish -> Verify public listing -> Open detail & verify bilingual content -> Attach public PDF -> Verify PDF access -> Change visibility to private -> Verify public access denied (404) -> Update research -> Verify updated public content -> Unpublish (set to draft) -> Verify public page/API no longer exposes it.

---

## 2. Test Execution Verification

```bash
$ php artisan test --filter=Research
PASS  Tests\Feature\Research\AdminLegalResearchTest (10 tests)
PASS  Tests\Feature\Research\PublicLegalResearchTest (6 tests)
PASS  Tests\Feature\Research\ResearchE2ELifecycleTest (1 test)
Tests: 17 passed (89 assertions)
Duration: 6.66s
```

Full backend test suite:
```bash
$ php artisan test
Tests: 135 passed (673 assertions)
Duration: 29.47s
```

Frontend production bundle verification:
```bash
$ npm run build
✓ 2497 modules transformed.
dist/index.html                             1.84 kB
dist/assets/index-CTReXi5K.css             55.19 kB
dist/assets/index-CMOoY3_G.js             388.40 kB
✓ built in 3.08s
```
