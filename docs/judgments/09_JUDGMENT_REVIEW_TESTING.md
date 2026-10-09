# 09. Judgment Reviews — Verification & Testing Strategy

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Module:** Phase 10 — Judgment Reviews & Judicial Analysis

---

## 1. Testing Strategy & Test Suites

The Judgment Reviews module is tested across three tiers:
1. **Admin Feature Testing:** `Tests\Feature\Judgments\AdminJudgmentReviewTest` (10 tests)
2. **Public Feature Testing:** `Tests\Feature\Judgments\PublicJudgmentReviewTest` (6 tests)
3. **End-to-End Lifecycle Testing:** `Tests\Feature\Judgments\JudgmentReviewE2ELifecycleTest` (1 comprehensive multi-step test)

Total Coverage: **17 tests, 97 assertions, 100% pass rate**.

---

## 2. Test Cases Breakdown

### Admin Feature Tests (`AdminJudgmentReviewTest.php`)
- `unauthenticated_admin_request_is_rejected`: Asserts 401 response without token.
- `user_without_permission_receives_403`: Verifies RBAC denial for unprivileged users.
- `admin_can_list_judgment_reviews_with_filters`: Tests listing and filtering by search, court, and status.
- `admin_can_create_judgment_review`: Verifies bilingual insertion, relationships, and audit logging.
- `slug_uniqueness_is_enforced`: Verifies that duplicate slugs are rejected.
- `published_slug_change_creates_301_redirect`: Asserts that updating a slug generates a record in the `redirects` table.
- `admin_can_soft_delete_judgment_review`: Tests soft deletion integrity.
- `admin_can_reorder_judgment_reviews`: Verifies batch reordering of sort ranks.
- `admin_can_preview_draft_judgment_review_with_indexing_safety`: Verifies draft preview payload and `X-Robots-Tag: noindex, nofollow` header.
- `admin_can_download_attached_pdf`: Tests administrative document streaming.

### Public Feature Tests (`PublicJudgmentReviewTest.php`)
- `public_judgments_empty_state`: Ensures empty data array when no published reviews exist.
- `public_judgments_returns_published_and_public_visibility_only`: Validates that draft and private reviews are excluded.
- `public_judgments_respects_locale_switching`: Tests dynamic resolution of Bengali vs English content based on `Accept-Language`.
- `public_detail_endpoint_returns_published_judgment`: Tests complete dossier payload and related items.
- `public_detail_returns_404_for_draft_or_private`: Validates that unauthorized reviews return 404.
- `public_pdf_download_security`: Ensures public download works for public PDFs and returns 404/403 for private PDFs.

### Lifecycle E2E Test (`JudgmentReviewE2ELifecycleTest.php`)
Executes the complete editorial progression:
1. Admin authenticates with Sanctum.
2. Creates a draft judgment review.
3. Verifies that public directory and detail endpoints return 404.
4. Previews the draft securely with `X-Robots-Tag: noindex, nofollow`.
5. Publishes the review.
6. Verifies public directory and detail exposure.
7. Attaches and streams a public certified PDF.
8. Retracts publication to draft.
9. Confirms immediate public 404 and cache invalidation.

---

## 3. Frontend Build & Static Analysis Verification

- TypeScript type-checking: `tsc` passing with zero errors.
- Vite build: Production bundle built in 3.71s with zero warnings.
